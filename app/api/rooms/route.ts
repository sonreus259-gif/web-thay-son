import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const db = getDb();
    const rooms = db.prepare("SELECT * FROM rooms WHERE status = 'ACTIVE' ORDER BY name ASC").all();
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Rooms GET error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách phòng học" }, { status: 500 });
  }
}
