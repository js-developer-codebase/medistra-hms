import { NextResponse } from "next/server";
import { OrganizationMgmtService } from "@/services/organization-mgmt.service";

export async function GET() {
  try {
    const settings = await OrganizationMgmtService.getOrgSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await OrganizationMgmtService.updateOrgSettings(body);
    return NextResponse.json({
      success: true,
      message: "Organization legal and corporate settings updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
