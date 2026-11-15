import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser, hasRole, logAudit } from "@/lib/auth";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");
    const db = getDb();

    let sql = `
      SELECT s.*,
             c.name as class_name,
             c.code as class_code,
             cr.title as course_title,
             r.name as room_name,
             r.location as room_location,
             u.full_name as teacher_name,
             u.email as teacher_email,
             u.avatar as teacher_avatar
      FROM class_sessions s
      JOIN classes c ON s.class_id = c.id
      JOIN courses cr ON c.course_id = cr.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.status != 'CANCELLED'
    `;
    const params: (string | number)[] = [];

    // RBAC Filtration
    if (hasRole(user, "ADMIN")) {
      // Admin sees all
    } else if (hasRole(user, "TEACHER")) {
      // Teacher sees sessions where they are assigned teacher or assigned to class
      sql += ` AND (s.teacher_id = ? OR s.class_id IN (SELECT class_id FROM class_teachers WHERE user_id = ?))`;
      params.push(user.id, user.id);
    } else if (hasRole(user, "STUDENT")) {
      // Student only sees sessions of classes they are enrolled in
      sql += ` AND s.class_id IN (SELECT class_id FROM enrollments WHERE user_id = ? AND status = 'ACTIVE')`;
      params.push(user.id);
    } else {
      return NextResponse.json({ sessions: [] });
    }

    if (classId) {
      sql += " AND s.class_id = ?";
      params.push(classId);
    }

    if (teacherId) {
      sql += " AND s.teacher_id = ?";
      params.push(teacherId);
    }

    sql += " ORDER BY s.start_at ASC";

    const sessions = db.prepare(sql).all(...params);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Sessions GET error:", error);
    return NextResponse.json({ error: "Lỗi tải lịch học" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền tạo lịch buổi học." }, { status: 403 });
    }

    const body = await request.json();
    const {
      classId,
      title,
      description = "",
      startAt,
      endAt,
      teacherId,
      deliveryMode = "HYBRID",
      roomId,
      meetingUrl = "",
      status = "SCHEDULED",
      note = "",
    } = body;

    if (!classId || !title || !startAt || !endAt) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Lớp học, Tên buổi học, Thời gian bắt đầu và kết thúc." },
        { status: 400 }
      );
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    // Rule 1: startAt < endAt
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return NextResponse.json(
        { error: "Thời gian bắt đầu phải sớm hơn thời gian kết thúc." },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check class exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cls = db.prepare("SELECT id, name, code FROM classes WHERE id = ?").get(classId) as any;
    if (!cls) {
      return NextResponse.json({ error: "Lớp học không tồn tại." }, { status: 404 });
    }

    // Rule 2: Teacher schedule overlap check
    // Overlap condition: startAt < existing.end_at AND endAt > existing.start_at
    if (teacherId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conflictSession = db.prepare(`
        SELECT s.id, s.title, s.start_at, s.end_at, c.name as class_name, u.full_name as teacher_name
        FROM class_sessions s
        JOIN classes c ON s.class_id = c.id
        JOIN users u ON s.teacher_id = u.id
        WHERE s.teacher_id = ?
          AND s.status != 'CANCELLED'
          AND s.start_at < ?
          AND s.end_at > ?
        LIMIT 1
      `).get(teacherId, endAt, startAt) as any;

      if (conflictSession) {
        const formatTime = (iso: string) => {
          const d = new Date(iso);
          return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày ${d.toLocaleDateString("vi-VN")}`;
        };
        return NextResponse.json(
          {
            error: `TRÙNG LỊCH GIẢNG VIÊN: Giảng viên ${conflictSession.teacher_name} đã có lịch dạy từ ${formatTime(conflictSession.start_at)} đến ${formatTime(conflictSession.end_at)} (Lớp: ${conflictSession.class_name} - ${conflictSession.title}).`,
          },
          { status: 409 }
        );
      }
    }

    // Rule 3: Room schedule overlap check
    if (roomId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conflictRoom = db.prepare(`
        SELECT s.id, s.title, s.start_at, s.end_at, r.name as room_name, c.name as class_name
        FROM class_sessions s
        JOIN rooms r ON s.room_id = r.id
        JOIN classes c ON s.class_id = c.id
        WHERE s.room_id = ?
          AND s.status != 'CANCELLED'
          AND s.start_at < ?
          AND s.end_at > ?
        LIMIT 1
      `).get(roomId, endAt, startAt) as any;

      if (conflictRoom) {
        const formatTime = (iso: string) => {
          const d = new Date(iso);
          return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày ${d.toLocaleDateString("vi-VN")}`;
        };
        return NextResponse.json(
          {
            error: `TRÙNG LỊCH PHÒNG HỌC: Phòng '${conflictRoom.room_name}' đã được xếp lớp từ ${formatTime(conflictRoom.start_at)} đến ${formatTime(conflictRoom.end_at)} (Lớp: ${conflictRoom.class_name}). Vui lòng chọn phòng khác.`,
          },
          { status: 409 }
        );
      }
    }

    const id = `sess-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO class_sessions (
        id, class_id, title, description, start_at, end_at, teacher_id,
        delivery_mode, room_id, meeting_url, status, note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      classId,
      title.trim(),
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
      now
    );

    logAudit(user.id, "CREATE_SESSION", "SESSION", id, { classId, title, startAt, endAt });

    return NextResponse.json({ success: true, sessionId: id });
  } catch (error) {
    console.error("Sessions POST error:", error);
    return NextResponse.json({ error: "Lỗi tạo buổi học" }, { status: 500 });
  }
}
