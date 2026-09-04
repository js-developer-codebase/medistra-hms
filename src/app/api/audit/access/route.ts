import { NextRequest, NextResponse } from "next/server";
import auditComplianceService from "@/services/audit-compliance.service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get("entity") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    const result = await auditComplianceService.getDataAccessLogs({
      entity,
      search,
      limit,
      skip,
    });

    return NextResponse.json({ success: true, data: result.logs, meta: { total: result.total, limit, skip } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch data access logs" },
      { status: 500 }
    );
  }
}
