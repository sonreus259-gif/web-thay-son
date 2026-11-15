import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser, hasRole, logAudit } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (!hasRole(user, "ADMIN") && !hasRole(user, "TEACHER"))) {
      return NextResponse.json({ error: "Không có quyền chỉnh sửa buổi học." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = db.prepare("SELECT * FROM class_sessions WHERE id = ?").get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy buổi học." }, { status: 404 });
    }

    // If teacher, only allowed if they are assigned teacher
    if (!hasRole(user, "ADMIN") && existing.teacher_id !== user.id) {
      return NextResponse.json({ error: "Giảng viên chỉ được chỉnh sửa buổi học do mình phụ trách." }, { status: 403 });
    }

    const {
      title = existing.title,
      description = existing.description,
      startAt = existing.start_at,
      endAt = existing.end_at,
      teacherId = existing.teacher_id,
      deliveryMode = existing.delivery_mode,
      roomId = existing.room_id,
      meetingUrl = existing.meeting_url,
      status = existing.status,
      note = existing.note,
    } = body;

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (startDate >= endDate) {
      return NextResponse.json({ error: "Thời gian bắt đầu phải sớm hơn thời gian kết thúc." }, { status: 400 });
    }

    // Overlap check for teacher
    if (teacherId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conflictSession = db.prepare(`
        SELECT s.id, s.title, s.start_at, s.end_at, c.name as class_name, u.full_name as teacher_name
        FROM class_sessions s
        JOIN classes c ON s.class_id = c.id
        JOIN users u ON s.teacher_id = u.id
        WHERE s.teacher_id = ?
          AND s.id != ?
          AND s.status != 'CANCELLED'
          AND s.start_at < ?
          AND s.end_at > ?
        LIMIT 1
      `).get(teacherId, id, endAt, startAt) as any;

      if (conflictSession) {
        return NextResponse.json(
          {
            error: `TRÙNG LỊCH GIẢNG VIÊN: Giảng viên đã có lịch dạy trùng giờ (Buổi: ${conflictSession.title} - Lớp: ${conflictSession.class_name}).`,
          },
          { status: 400 }
        );
      }
    }

    // Overlap check for room
    if (roomId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conflictRoom = db.prepare(`
        SELECT s.id, s.title, s.start_at, s.end_at, r.name as room_name, c.name as class_name
        FROM class_sessions s
        JOIN rooms r ON s.room_id = r.id
        JOIN classes c ON s.class_id = c.id
        WHERE s.room_id = ?
          AND s.id != ?
          AND s.status != 'CANCELLED'
          AND s.start_at < ?
          AND s.end_at > ?
        LIMIT 1
      `).get(roomId, id, endAt, startAt) as any;

      if (conflictRoom) {
        return NextResponse.json(
          {
            error: `TRÙNG LỊCH PHÒNG HỌC: Phòng '${conflictRoom.room_name}' đã được xếp lớp trùng thời gian.`,
          },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE class_sessions SET
        title = ?, description = ?, start_at = ?, end_at = ?, teacher_id = ?,
        delivery_mode = ?, room_id = ?, meeting_url = ?, status = ?, note = ?, updated_at = ?
      WHERE id = ?
    `).run(
      title,
      description,
      startAt,
      endAt,
      teacherId || null,
      deliveryMode,
      roomId || null,
      meetingUrl || null,
      status,
      note,
      now,
      id
    );

    logAudit(user.id, "UPDATE_SESSION", "SESSION", id, { title, startAt, endAt });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session PUT error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật buổi học" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền hủy buổi học." }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();
    const now = new Date().toISOString();

    db.prepare("UPDATE class_sessions SET status = 'CANCELLED', updated_at = ? WHERE id = ?").run(now, id);
    logAudit(user.id, "CANCEL_SESSION", "SESSION", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session DELETE error:", error);
    return NextResponse.json({ error: "Lỗi hủy buổi học" }, { status: 500 });
  }
}
