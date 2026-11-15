import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser, hasRole, logAudit } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cls = db.prepare(`
      SELECT c.*,
             cr.title as course_title,
             cr.code as course_code
      FROM classes c
      JOIN courses cr ON c.course_id = cr.id
      WHERE c.id = ?
    `).get(id) as any;

    if (!cls) {
      return NextResponse.json({ error: "Không tìm thấy lớp học" }, { status: 404 });
    }

    // RBAC Authorization check
    if (hasRole(user, "ADMIN")) {
      // Admin has full access
    } else if (hasRole(user, "TEACHER")) {
      // Check if teacher is assigned to this class
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assigned = db.prepare(
        "SELECT id FROM class_teachers WHERE class_id = ? AND user_id = ?"
      ).get(id, user.id) as any;
      if (!assigned) {
        return NextResponse.json(
          { error: "Bạn không có quyền truy cập lớp học này vì không được phân công phụ trách." },
          { status: 403 }
        );
      }
    } else if (hasRole(user, "STUDENT")) {
      // Check if student is actively enrolled
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrolled = db.prepare(
        "SELECT id FROM enrollments WHERE class_id = ? AND user_id = ? AND status = 'ACTIVE'"
      ).get(id, user.id) as any;
      if (!enrolled) {
        return NextResponse.json(
          { error: "Bạn chưa được ghi danh vào lớp học này." },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    // Fetch Teachers
    const teachers = db.prepare(`
      SELECT u.id, u.full_name, u.email, u.phone, u.avatar, u.title
      FROM class_teachers ct
      JOIN users u ON ct.user_id = u.id
      WHERE ct.class_id = ?
    `).all(id);

    // Fetch Enrolled Students (Only Admin and assigned Teacher can see full student list)
    let students: unknown[] = [];
    if (hasRole(user, "ADMIN") || hasRole(user, "TEACHER")) {
      students = db.prepare(`
        SELECT u.id, u.full_name, u.email, u.phone, u.avatar,
               e.status as enrollment_status, e.enrolled_at, e.progress_percent
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        WHERE e.class_id = ?
        ORDER BY e.enrolled_at DESC
      `).all(id);
    }

    // Fetch Sessions
    const sessions = db.prepare(`
      SELECT s.*,
             r.name as room_name,
             u.full_name as teacher_name
      FROM class_sessions s
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.class_id = ? AND s.status != 'CANCELLED'
      ORDER BY s.start_at ASC
    `).all(id);

    return NextResponse.json({
      class: cls,
      teachers,
      students,
      sessions,
    });
  } catch (error) {
    console.error("Class detail GET error:", error);
    return NextResponse.json({ error: "Lỗi tải chi tiết lớp học" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json(
        { error: "Chỉ Quản trị viên mới có quyền cập nhật thông tin lớp học." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = db.prepare("SELECT * FROM classes WHERE id = ?").get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy lớp học" }, { status: 404 });
    }

    const {
      name = existing.name,
      description = existing.description,
      startDate = existing.start_date,
      endDate = existing.end_date,
      capacity = existing.capacity,
      deliveryMode = existing.delivery_mode,
      status = existing.status,
      teacherIds,
    } = body;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE classes SET
        name = ?, description = ?, start_date = ?, end_date = ?,
        capacity = ?, delivery_mode = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(
      name.trim(),
      description,
      startDate,
      endDate,
      Number(capacity),
      deliveryMode,
      status,
      now,
      id
    );

    // Update teachers if provided
    if (Array.isArray(teacherIds)) {
      db.prepare("DELETE FROM class_teachers WHERE class_id = ?").run(id);
      for (const tId of teacherIds) {
        db.prepare(`
          INSERT INTO class_teachers (id, class_id, user_id, created_at)
          VALUES (?, ?, ?, ?)
        `).run(`ct-${crypto.randomUUID()}`, id, tId, now);
      }
    }

    logAudit(user.id, "UPDATE_CLASS", "CLASS", id, { name, status });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Class PUT error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật lớp học" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền hủy lớp học." }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();

    // Soft-delete / set status to CANCELLED to preserve educational history
    const now = new Date().toISOString();
    db.prepare("UPDATE classes SET status = 'CANCELLED', updated_at = ? WHERE id = ?").run(now, id);
    logAudit(user.id, "CANCEL_CLASS", "CLASS", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Class DELETE error:", error);
    return NextResponse.json({ error: "Lỗi xóa lớp học" }, { status: 500 });
  }
}
