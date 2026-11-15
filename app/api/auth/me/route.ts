import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth Me API Error:", error);
    return NextResponse.json({ error: "Lỗi xác thực người dùng" }, { status: 500 });
  }
}
