import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser, hasRole, logAudit } from "@/lib/auth";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    let sql = `
      SELECT c.*,
             (SELECT COUNT(*) FROM classes WHERE course_id = c.id) as class_count,
             (SELECT COUNT(*) FROM enrollments e JOIN classes cl ON e.class_id = cl.id WHERE cl.course_id = c.id AND e.status = 'ACTIVE') as total_students
      FROM courses c
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // If student, only show published courses
    if (user && !hasRole(user, "ADMIN") && !hasRole(user, "TEACHER")) {
      sql += " AND c.is_published = 1 AND c.status = 'PUBLISHED'";
    }

    if (query) {
      sql += " AND (c.title LIKE ? OR c.code LIKE ? OR c.category LIKE ?)";
      const pattern = `%${query}%`;
      params.push(pattern, pattern, pattern);
    }

    sql += " ORDER BY c.created_at DESC";

    const courses = db.prepare(sql).all(...params);
    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Courses GET API Error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách khóa học" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Không có quyền thực hiện hành động này (Chỉ dành cho Admin)." }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      code,
      slug,
      category = "AI",
      level = "Chuyên sâu",
      shortDescription = "",
      description = "",
      thumbnail = "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500",
      badge = "CHUYÊN SÂU",
      price = 0,
      durationWeeks = 8,
      totalLessons = 24,
      status = "PUBLISHED",
      isPublished = 1,
      isFeatured = 0,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tiêu đề khóa học không được để trống." }, { status: 400 });
    }

    const db = getDb();
    const id = `course-${crypto.randomUUID()}`;
    const generatedSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO courses (
        id, code, title, slug, category, level, short_description, description,
        thumbnail, badge, price, duration_weeks, total_lessons, status, is_published, is_featured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      code || `CRS-${Date.now().toString().slice(-4)}`,
      title.trim(),
      generatedSlug,
      category,
      level,
      shortDescription,
      description,
      thumbnail,
      badge,
      Number(price) || 0,
      Number(durationWeeks) || 8,
      Number(totalLessons) || 24,
      status,
      isPublished ? 1 : 0,
      isFeatured ? 1 : 0,
      now,
      now
    );

    logAudit(user.id, "CREATE_COURSE", "COURSE", id, { title });

    return NextResponse.json({ success: true, courseId: id });
  } catch (error) {
    console.error("Courses POST API Error:", error);
    return NextResponse.json({ error: "Lỗi tạo khóa học" }, { status: 500 });
  }
}
