import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser, hasRole, hashPassword, logAudit } from "@/lib/auth";
import crypto from "crypto";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền cập nhật người dùng." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    const {
      fullName = existing.full_name,
      phone = existing.phone,
      title = existing.title,
      status = existing.status,
      password,
      roleCodes,
    } = body;

    const now = new Date().toISOString();

    if (password && password.trim()) {
      const newHash = hashPassword(password);
      db.prepare(`
        UPDATE users SET
          full_name = ?, phone = ?, title = ?, status = ?,
          password_hash = ?, password_changed_at = ?, updated_at = ?
        WHERE id = ?
      `).run(fullName.trim(), phone, title, status, newHash, now, now, id);
    } else {
      db.prepare(`
        UPDATE users SET
          full_name = ?, phone = ?, title = ?, status = ?, updated_at = ?
        WHERE id = ?
      `).run(fullName.trim(), phone, title, status, now, id);
    }

    // Update roles if provided
    if (Array.isArray(roleCodes)) {
      db.prepare("DELETE FROM user_roles WHERE user_id = ?").run(id);
      for (const r of roleCodes) {
        db.prepare(`
          INSERT INTO user_roles (id, user_id, role_code, created_at)
          VALUES (?, ?, ?, ?)
        `).run(`ur-${crypto.randomUUID()}`, id, r, now);
      }
    }

    logAudit(user.id, "UPDATE_USER", "USER", id, { status, roleCodes });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User PUT error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật người dùng" }, { status: 500 });
  }
}
