import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { verifyPassword, createSession, logAudit } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Email và Mật khẩu." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();

    // Query user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = db.prepare(
      "SELECT id, full_name, email, phone, password_hash, status, avatar, title FROM users WHERE LOWER(email) = ?"
    ).get(cleanEmail) as any;

    if (!user) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === "LOCKED") {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên." },
        { status: 403 }
      );
    }
    if (user.status === "INACTIVE" || user.status === "PENDING") {
      return NextResponse.json(
        { error: "Tài khoản chưa được kích hoạt hoặc đang tạm ngưng." },
        { status: 403 }
      );
    }

    // Verify password
    const isMatch = verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    // Create session
    const { token, expiresAt } = createSession(user.id);

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set("lms_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
    });

    // Get user roles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRoles = db.prepare(
      "SELECT role_code FROM user_roles WHERE user_id = ?"
    ).all(user.id) as any[];
    const roles = userRoles.map((r) => r.role_code);

    // Audit log
    logAudit(user.id, "LOGIN", "USER", user.id, { email: cleanEmail });

    // Return safe user object (NO passwordHash)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        avatar: user.avatar,
        title: user.title,
        roles,
      },
    });
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi trong quá trình xử lý đăng nhập." },
      { status: 500 }
    );
  }
}
