import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser, hasRole, logAudit } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền hủy ghi danh học viên." }, { status: 403 });
    }

    const { id: classId, userId } = await params;
    const db = getDb();

    db.prepare("DELETE FROM enrollments WHERE class_id = ? AND user_id = ?").run(classId, userId);
    logAudit(user.id, "REMOVE_ENROLLMENT", "CLASS", classId, { userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Enrollment DELETE error:", error);
    return NextResponse.json({ error: "Lỗi hủy ghi danh học viên" }, { status: 500 });
  }
}
