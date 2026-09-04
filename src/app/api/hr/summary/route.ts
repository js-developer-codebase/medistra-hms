import { NextResponse } from "next/server";
import hrService from "@/services/hr.service";

export async function GET() {
  try {
    const stats = await hrService.getHRSummaryStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Failed to fetch HR summary:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch HR summary" },
      { status: 500 }
    );
  }
}
