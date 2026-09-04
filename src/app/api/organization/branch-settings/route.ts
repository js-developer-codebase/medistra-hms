import { NextResponse } from "next/server";
import { OrganizationMgmtService } from "@/services/organization-mgmt.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || undefined;
    const settings = await OrganizationMgmtService.getBranchSettings(branchId);
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await OrganizationMgmtService.updateBranchSettings(body);
    return NextResponse.json({
      success: true,
      message: "Satellite branch operating schedule and logistics updated.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
