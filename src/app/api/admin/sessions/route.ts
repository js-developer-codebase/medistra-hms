import { NextResponse } from "next/server";
import { AdminService } from "@/services/admin.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || "";

    const sessions = await AdminService.getUserSessions({ status, search });
    return NextResponse.json({ success: true, data: sessions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await AdminService.terminateAllStaleSessions();
    return NextResponse.json({
      success: true,
      message: "All stale and expired sessions have been terminated.",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
