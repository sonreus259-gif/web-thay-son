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
    const courseId = searchParams.get("courseId");
    const db = getDb();

    let sql = `
      SELECT c.*,
             cr.title as course_title,
             cr.code as course_code,
             cr.thumbnail as course_thumbnail,
             (SELECT COUNT(*) FROM enrollments WHERE class_id = c.id AND status = 'ACTIVE') as enrolled_count,
             (SELECT COUNT(*) FROM class_sessions WHERE class_id = c.id AND status != 'CANCELLED') as session_count
      FROM classes c
      JOIN courses cr ON c.course_id = cr.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // Role-based query filtration (Server-side RBAC)
    if (hasRole(user, "ADMIN")) {
      // Admin sees all
    } else if (hasRole(user, "TEACHER")) {
      // Teacher only sees classes they are assigned to
      sql += ` AND c.id IN (SELECT class_id FROM class_teachers WHERE user_id = ?)`;
      params.push(user.id);
    } else if (hasRole(user, "STUDENT")) {
      // Student only sees classes they are actively enrolled in
      sql += ` AND c.id IN (SELECT class_id FROM enrollments WHERE user_id = ? AND status = 'ACTIVE')`;
      params.push(user.id);
    } else {
      return NextResponse.json({ classes: [] });
    }

    if (courseId) {
      sql += " AND c.course_id = ?";
      params.push(courseId);
    }

    sql += " ORDER BY c.created_at DESC";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classes = db.prepare(sql).all(...params) as any[];

    // Fetch teachers for each class
    for (const cls of classes) {
      const teachers = db.prepare(`
        SELECT u.id, u.full_name, u.email, u.avatar, u.title
        FROM class_teachers ct
        JOIN users u ON ct.user_id = u.id
        WHERE ct.class_id = ?
      `).all(cls.id);
      cls.teachers = teachers;
    }

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Classes GET error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách lớp học" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền tạo lớp học." }, { status: 403 });
    }

    const body = await request.json();
    const {
      courseId,
      code,
      name,
      description = "",
      startDate = "",
      endDate = "",
      capacity = 30,
      deliveryMode = "HYBRID",
      status = "OPEN",
      teacherIds = [],
    } = body;

    if (!courseId || !code || !name) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ Khóa học, Mã lớp và Tên lớp." }, { status: 400 });
    }

    if (Number(capacity) <= 0) {
      return NextResponse.json({ error: "Sĩ số tối đa phải lớn hơn 0." }, { status: 400 });
    }

    const db = getDb();

    // Check code unique
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = db.prepare("SELECT id FROM classes WHERE code = ?").get(code.trim().toUpperCase()) as any;
    if (existing) {
      return NextResponse.json({ error: `Mã lớp '${code.trim().toUpperCase()}' đã tồn tại trên hệ thống.` }, { status: 400 });
    }

    // Check course exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const course = db.prepare("SELECT id FROM courses WHERE id = ?").get(courseId) as any;
    if (!course) {
      return NextResponse.json({ error: "Khóa học được chọn không tồn tại." }, { status: 404 });
    }

    const id = `class-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO classes (
        id, course_id, code, name, description, start_date, end_date,
        capacity, delivery_mode, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      courseId,
      code.trim().toUpperCase(),
      name.trim(),
      description,
      startDate,
      endDate,
      Number(capacity),
      deliveryMode,
      status,
      now,
      now
    );

    // Assign teachers
    if (Array.isArray(teacherIds)) {
      for (const tId of teacherIds) {
        db.prepare(`
          INSERT OR IGNORE INTO class_teachers (id, class_id, user_id, created_at)
          VALUES (?, ?, ?, ?)
        `).run(`ct-${crypto.randomUUID()}`, id, tId, now);
      }
    }

    logAudit(user.id, "CREATE_CLASS", "CLASS", id, { code, name });

    return NextResponse.json({ success: true, classId: id });
  } catch (error) {
    console.error("Classes POST error:", error);
    return NextResponse.json({ error: "Lỗi tạo lớp học" }, { status: 500 });
  }
}
