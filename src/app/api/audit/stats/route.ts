import { NextRequest, NextResponse } from "next/server";
import auditComplianceService from "@/services/audit-compliance.service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const stats = await auditComplianceService.getTelemetryStats();
    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch audit telemetry" },
      { status: 500 }
    );
  }
}
