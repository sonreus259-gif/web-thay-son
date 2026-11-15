import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser, hasRole, logAudit } from "@/lib/auth";
import crypto from "crypto";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền ghi danh học viên vào lớp." }, { status: 403 });
    }

    const { id: classId } = await params;
    const body = await request.json();
    const { userIds, userId } = body;

    const targetUserIds: string[] = Array.isArray(userIds)
      ? userIds
      : userId
      ? [userId]
      : [];

    if (targetUserIds.length === 0) {
      return NextResponse.json({ error: "Vui lòng chọn ít nhất một học viên để ghi danh." }, { status: 400 });
    }

    const db = getDb();

    // Check class exists and capacity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cls = db.prepare("SELECT * FROM classes WHERE id = ?").get(classId) as any;
    if (!cls) {
      return NextResponse.json({ error: "Lớp học không tồn tại." }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentEnrolled = db.prepare(
      "SELECT COUNT(*) as count FROM enrollments WHERE class_id = ? AND status = 'ACTIVE'"
    ).get(classId) as any;

    if (currentEnrolled.count + targetUserIds.length > cls.capacity) {
      return NextResponse.json(
        {
          error: `Vượt quá sĩ số tối đa của lớp (${cls.capacity} học viên). Hiện lớp đã có ${currentEnrolled.count} học viên.`,
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const enrolledUsers: string[] = [];
    const skippedUsers: string[] = [];

    for (const uid of targetUserIds) {
      // Check user exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const targetUser = db.prepare("SELECT id, full_name, email FROM users WHERE id = ?").get(uid) as any;
      if (!targetUser) continue;

      // Ensure user has STUDENT role
      db.prepare(`
        INSERT OR IGNORE INTO user_roles (id, user_id, role_code, created_at)
        VALUES (?, ?, 'STUDENT', ?)
      `).run(`ur-${crypto.randomUUID()}`, uid, now);

      // Check if already enrolled
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingEnrollment = db.prepare(
        "SELECT id, status FROM enrollments WHERE user_id = ? AND class_id = ?"
      ).get(uid, classId) as any;

      if (existingEnrollment) {
        if (existingEnrollment.status !== "ACTIVE") {
          // Re-activate
          db.prepare("UPDATE enrollments SET status = 'ACTIVE', updated_at = ? WHERE id = ?").run(
            now,
            existingEnrollment.id
          );
          enrolledUsers.push(targetUser.full_name);
        } else {
          skippedUsers.push(targetUser.full_name);
        }
      } else {
        const enrId = `enr-${crypto.randomUUID()}`;
        db.prepare(`
          INSERT INTO enrollments (id, user_id, class_id, status, enrolled_at, progress_percent, created_at, updated_at)
          VALUES (?, ?, ?, 'ACTIVE', ?, 0, ?, ?)
        `).run(enrId, uid, classId, now, now, now);
        enrolledUsers.push(targetUser.full_name);
      }
    }

    logAudit(user.id, "CREATE_ENROLLMENT", "CLASS", classId, {
      enrolledCount: enrolledUsers.length,
      enrolledUsers,
      skippedUsers,
    });

    return NextResponse.json({
      success: true,
      enrolledCount: enrolledUsers.length,
      enrolledUsers,
      skippedUsers,
    });
  } catch (error) {
    console.error("Enrollment POST error:", error);
    return NextResponse.json({ error: "Lỗi ghi danh học viên" }, { status: 500 });
  }
}
