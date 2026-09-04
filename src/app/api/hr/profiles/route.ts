import { NextRequest, NextResponse } from "next/server";
import hrService from "@/services/hr.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId") || undefined;
    const search = searchParams.get("search") || undefined;

    const profiles = await hrService.getStaffProfiles(search, departmentId);
    return NextResponse.json({ success: true, count: profiles.length, data: profiles });
  } catch (error: any) {
    console.error("Failed to fetch staff profiles:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch staff profiles" },
      { status: 500 }
    );
  }
}
