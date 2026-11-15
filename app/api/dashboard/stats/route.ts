import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser, hasRole } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const db = getDb();
    const now = new Date().toISOString();

    if (hasRole(user, "ADMIN")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentCount = (db.prepare(`
        SELECT COUNT(DISTINCT user_id) as cnt FROM user_roles WHERE role_code = 'STUDENT'
      `).get() as any).cnt;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const courseCount = (db.prepare("SELECT COUNT(*) as cnt FROM courses").get() as any).cnt;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const classCount = (db.prepare("SELECT COUNT(*) as cnt FROM classes WHERE status != 'CANCELLED'").get() as any).cnt;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionCount = (db.prepare("SELECT COUNT(*) as cnt FROM class_sessions WHERE status = 'SCHEDULED'").get() as any).cnt;

      // Top courses
      const hotCourses = db.prepare(`
        SELECT c.id, c.title, c.code, c.badge,
               (SELECT COUNT(*) FROM enrollments e JOIN classes cl ON e.class_id = cl.id WHERE cl.course_id = c.id AND e.status = 'ACTIVE') as student_count
        FROM courses c
        ORDER BY student_count DESC
        LIMIT 4
      `).all();

      // Upcoming sessions
      const upcomingSessions = db.prepare(`
        SELECT s.*, c.name as class_name, c.code as class_code, u.full_name as teacher_name
        FROM class_sessions s
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN users u ON s.teacher_id = u.id
        WHERE s.status = 'SCHEDULED' AND s.start_at >= ?
        ORDER BY s.start_at ASC
        LIMIT 5
      `).all(now);

      return NextResponse.json({
        role: "ADMIN",
        totalStudents: studentCount,
        totalCourses: courseCount,
        totalClasses: classCount,
        totalSessions: sessionCount,
        hotCourses,
        upcomingSessions,
      });
    }

    if (hasRole(user, "TEACHER")) {
      // Classes assigned
      const myClasses = db.prepare(`
        SELECT c.*,
               (SELECT COUNT(*) FROM enrollments WHERE class_id = c.id AND status = 'ACTIVE') as student_count
        FROM classes c
        JOIN class_teachers ct ON c.id = ct.class_id
        WHERE ct.user_id = ? AND c.status != 'CANCELLED'
      `).all(user.id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalStudents = (db.prepare(`
        SELECT COUNT(DISTINCT e.user_id) as cnt
        FROM enrollments e
        JOIN class_teachers ct ON e.class_id = ct.class_id
        WHERE ct.user_id = ? AND e.status = 'ACTIVE'
      `).get(user.id) as any).cnt;

      const upcomingSessions = db.prepare(`
        SELECT s.*, c.name as class_name, c.code as class_code
        FROM class_sessions s
        JOIN classes c ON s.class_id = c.id
        WHERE (s.teacher_id = ? OR s.class_id IN (SELECT class_id FROM class_teachers WHERE user_id = ?))
          AND s.status = 'SCHEDULED'
        ORDER BY s.start_at ASC
        LIMIT 5
      `).all(user.id, user.id);

      return NextResponse.json({
        role: "TEACHER",
        totalClasses: myClasses.length,
        totalStudents,
        upcomingSessions,
        myClasses,
      });
    }

    // STUDENT
    const myEnrollments = db.prepare(`
      SELECT c.*, cr.title as course_title, cr.thumbnail as course_thumbnail,
             e.progress_percent, e.enrolled_at
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      JOIN courses cr ON c.course_id = cr.id
      WHERE e.user_id = ? AND e.status = 'ACTIVE'
    `).all(user.id);

    const upcomingSessions = db.prepare(`
      SELECT s.*, c.name as class_name, c.code as class_code, u.full_name as teacher_name
      FROM class_sessions s
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.class_id IN (SELECT class_id FROM enrollments WHERE user_id = ? AND status = 'ACTIVE')
        AND s.status = 'SCHEDULED'
      ORDER BY s.start_at ASC
      LIMIT 5
    `).all(user.id);

    return NextResponse.json({
      role: "STUDENT",
      totalClasses: myEnrollments.length,
      upcomingSessions,
      myEnrollments,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Lỗi tải số liệu thống kê" }, { status: 500 });
  }
}
