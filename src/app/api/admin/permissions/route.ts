import { NextResponse } from "next/server";
import { AdminService } from "@/services/admin.service";

export async function GET() {
  try {
    const matrix = await AdminService.getPermissionsMatrix();
    return NextResponse.json({ success: true, data: matrix });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
