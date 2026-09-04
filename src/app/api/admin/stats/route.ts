import { NextResponse } from "next/server";
import { AdminService } from "@/services/admin.service";

export async function GET() {
  try {
    const stats = await AdminService.getAdminSummaryStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
