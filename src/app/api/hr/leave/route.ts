import { NextRequest, NextResponse } from "next/server";
import hrService from "@/services/hr.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const leaveType = searchParams.get("leaveType") || undefined;
    const userId = searchParams.get("userId") || undefined;

    const leaves = await hrService.getLeaves({ status, leaveType, userId });
    return NextResponse.json({ success: true, count: leaves.length, data: leaves });
  } catch (error: any) {
    console.error("Failed to fetch leaves:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch leaves" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await hrService.applyLeave(body);
    return NextResponse.json(
      { success: true, message: "Leave application submitted successfully", data: created },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to apply leave:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to submit leave application" },
      { status: 400 }
    );
  }
}
