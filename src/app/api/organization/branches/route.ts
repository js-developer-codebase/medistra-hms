import { NextResponse } from "next/server";
import { OrganizationMgmtService } from "@/services/organization-mgmt.service";

export async function GET() {
  try {
    const branches = await OrganizationMgmtService.getBranches();
    return NextResponse.json({ success: true, data: branches });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.organizationName || !body.headQuarter) {
      return NextResponse.json(
        { success: false, message: "Branch name and headquarters parent organization are required." },
        { status: 400 }
      );
    }
    const branch = await OrganizationMgmtService.createBranch(body);
    return NextResponse.json({ success: true, data: branch }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
