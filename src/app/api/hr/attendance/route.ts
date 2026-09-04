import { NextRequest, NextResponse } from "next/server";
import hrService from "@/services/hr.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const status = searchParams.get("status") || undefined;

    const attendance = await hrService.getAttendance(date, status);
    return NextResponse.json({ success: true, count: attendance.length, data: attendance });
  } catch (error: any) {
    console.error("Failed to fetch attendance:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const record = await hrService.recordAttendance(body);
    return NextResponse.json(
      { success: true, message: "Attendance logged successfully", data: record },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to log attendance:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to log attendance" },
      { status: 400 }
    );
  }
}
