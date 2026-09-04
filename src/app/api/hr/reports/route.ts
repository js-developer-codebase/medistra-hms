import { NextRequest, NextResponse } from "next/server";
import hrService from "@/services/hr.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || undefined;

    const reports = await hrService.getHRReports(timeframe);
    return NextResponse.json({ success: true, data: reports });
  } catch (error: any) {
    console.error("Failed to generate HR reports:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to generate HR reports" },
      { status: 500 }
    );
  }
}
