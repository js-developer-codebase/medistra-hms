import { NextResponse } from "next/server";
import hrService from "@/services/hr.service";

export async function GET() {
  try {
    const departments = await hrService.getHRDepartments();
    return NextResponse.json({ success: true, count: departments.length, data: departments });
  } catch (error: any) {
    console.error("Failed to fetch HR departments:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch HR departments" },
      { status: 500 }
    );
  }
}
