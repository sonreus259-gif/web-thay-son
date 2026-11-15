import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser, hasRole, logAudit } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(id) as any;
    if (!course) {
      return NextResponse.json({ error: "Không tìm thấy khóa học" }, { status: 404 });
    }

    const classes = db.prepare(`
      SELECT c.*,
             (SELECT COUNT(*) FROM enrollments WHERE class_id = c.id AND status = 'ACTIVE') as student_count
      FROM classes c
      WHERE c.course_id = ?
    `).all(id);

    return NextResponse.json({ course, classes });
  } catch (error) {
    console.error("Course detail error:", error);
    return NextResponse.json({ error: "Lỗi tải chi tiết khóa học" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền cập nhật khóa học." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    // Check course exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = db.prepare("SELECT * FROM courses WHERE id = ?").get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy khóa học" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const {
      title = existing.title,
      code = existing.code,
      slug = existing.slug,
      category = existing.category,
      level = existing.level,
      shortDescription = existing.short_description,
      description = existing.description,
      thumbnail = existing.thumbnail,
      badge = existing.badge,
      price = existing.price,
      durationWeeks = existing.duration_weeks,
      totalLessons = existing.total_lessons,
      status = existing.status,
      isPublished = existing.is_published,
      isFeatured = existing.is_featured,
    } = body;

    db.prepare(`
      UPDATE courses SET
        title = ?, code = ?, slug = ?, category = ?, level = ?, short_description = ?,
        description = ?, thumbnail = ?, badge = ?, price = ?, duration_weeks = ?,
        total_lessons = ?, status = ?, is_published = ?, is_featured = ?, updated_at = ?
      WHERE id = ?
    `).run(
      title,
      code,
      slug,
      category,
      level,
      shortDescription,
      description,
      thumbnail,
      badge,
      Number(price),
      Number(durationWeeks),
      Number(totalLessons),
      status,
      isPublished ? 1 : 0,
      isFeatured ? 1 : 0,
      now,
      id
    );

    logAudit(user.id, "UPDATE_COURSE", "COURSE", id, { title });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Course PUT error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật khóa học" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền xóa khóa học." }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();

    // Check if course has classes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classCount = db.prepare("SELECT COUNT(*) as count FROM classes WHERE course_id = ?").get(id) as any;
    if (classCount && classCount.count > 0) {
      return NextResponse.json(
        {
          error: `Không thể xóa khóa học này vì đã có ${classCount.count} lớp học liên kết. Hãy chuyển trạng thái khóa học sang ARCHIVED (Lưu trữ) để đảm bảo toàn vẹn dữ liệu.`,
        },
        { status: 400 }
      );
    }

    db.prepare("DELETE FROM courses WHERE id = ?").run(id);
    logAudit(user.id, "DELETE_COURSE", "COURSE", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Course DELETE error:", error);
    return NextResponse.json({ error: "Lỗi xóa khóa học" }, { status: 500 });
  }
}
