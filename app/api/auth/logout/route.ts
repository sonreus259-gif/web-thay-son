import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession, getCurrentUser, logAudit } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("lms_session");

    if (sessionCookie?.value) {
      deleteSession(sessionCookie.value);
    }

    cookieStore.delete("lms_session");

    if (user) {
      logAudit(user.id, "LOGOUT", "USER", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Lỗi đăng xuất" }, { status: 500 });
  }
}
