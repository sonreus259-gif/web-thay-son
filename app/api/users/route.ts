import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser, hasRole, hashPassword, logAudit } from "@/lib/auth";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const role = searchParams.get("role") || "";
    const db = getDb();

    let sql = `
      SELECT u.id, u.full_name, u.email, u.phone, u.status, u.avatar, u.title,
             u.email_verified_at, u.last_login_at, u.created_at, u.updated_at
      FROM users u
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // RBAC: If teacher, only allowed to see students from their classes
    if (!hasRole(user, "ADMIN")) {
      if (hasRole(user, "TEACHER")) {
        sql += ` AND u.id IN (
          SELECT e.user_id FROM enrollments e
          JOIN class_teachers ct ON e.class_id = ct.class_id
          WHERE ct.user_id = ?
        )`;
        params.push(user.id);
      } else {
        return NextResponse.json({ error: "Không có quyền xem danh sách người dùng" }, { status: 403 });
      }
    }

    if (query) {
      sql += " AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
      const pattern = `%${query}%`;
      params.push(pattern, pattern, pattern);
    }

    if (role) {
      sql += " AND u.id IN (SELECT user_id FROM user_roles WHERE role_code = ?)";
      params.push(role);
    }

    sql += " ORDER BY u.created_at DESC";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = db.prepare(sql).all(...params) as any[];

    // Fetch roles for each user
    for (const u of users) {
      const roles = db.prepare("SELECT role_code FROM user_roles WHERE user_id = ?").all(u.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      u.roles = roles.map((r: any) => r.role_code);
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách người dùng" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, "ADMIN")) {
      return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền tạo người dùng." }, { status: 403 });
    }

    const body = await request.json();
    const {
      fullName,
      email,
      phone = "",
      password,
      roleCodes = ["STUDENT"],
      title = "",
      status = "ACTIVE",
    } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập Họ tên, Email và Mật khẩu." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();

    // Check unique email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").get(cleanEmail) as any;
    if (existing) {
      return NextResponse.json({ error: `Email '${cleanEmail}' đã được sử dụng trên hệ thống.` }, { status: 400 });
    }

    const id = `usr-${crypto.randomUUID()}`;
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (
        id, full_name, email, phone, password_hash, status,
        avatar, title, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      fullName.trim(),
      cleanEmail,
      phone.trim() || null,
      passwordHash,
      status,
      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      title.trim() || null,
      now,
      now
    );

    // Assign roles
    if (Array.isArray(roleCodes)) {
      for (const r of roleCodes) {
        db.prepare(`
          INSERT OR IGNORE INTO user_roles (id, user_id, role_code, created_at)
          VALUES (?, ?, ?, ?)
        `).run(`ur-${crypto.randomUUID()}`, id, r, now);
      }
    }

    logAudit(user.id, "CREATE_USER", "USER", id, { email: cleanEmail, roleCodes });

    return NextResponse.json({ success: true, userId: id });
  } catch (error) {
    console.error("Users POST error:", error);
    return NextResponse.json({ error: "Lỗi tạo người dùng mới" }, { status: 500 });
  }
}
