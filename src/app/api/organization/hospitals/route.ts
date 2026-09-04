import { NextResponse } from "next/server";
import { OrganizationMgmtService } from "@/services/organization-mgmt.service";

export async function GET() {
  try {
    const hospitals = await OrganizationMgmtService.getHospitals();
    return NextResponse.json({ success: true, data: hospitals });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.organizationName || !body.organizationId) {
      return NextResponse.json(
        { success: false, message: "Organization name and ID are required." },
        { status: 400 }
      );
    }
    const hospital = await OrganizationMgmtService.createHospital(body);
    return NextResponse.json({ success: true, data: hospital }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
