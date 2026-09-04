import { NextRequest, NextResponse } from "next/server";
import hrService from "@/services/hr.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shiftType = searchParams.get("shiftType") || undefined;
    const status = searchParams.get("status") || undefined;
    const wardId = searchParams.get("wardId") || undefined;

    const shifts = await hrService.getShifts({ shiftType, status, wardId });
    return NextResponse.json({ success: true, count: shifts.length, data: shifts });
  } catch (error: any) {
    console.error("Failed to fetch shifts:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch shifts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await hrService.createShift(body);
    return NextResponse.json(
      { success: true, message: "Shift assigned successfully", data: created },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to assign shift:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to assign shift" },
      { status: 400 }
    );
  }
}
