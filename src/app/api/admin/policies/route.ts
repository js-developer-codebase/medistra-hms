import { NextResponse } from "next/server";
import { AdminService } from "@/services/admin.service";

export async function GET() {
  try {
    const policies = await AdminService.getAccessPolicies();
    return NextResponse.json({ success: true, data: policies });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await AdminService.updateAccessPolicies(body);
    return NextResponse.json({
      success: true,
      message: "Security and access control policies updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
