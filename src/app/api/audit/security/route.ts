import { NextRequest, NextResponse } from "next/server";
import auditComplianceService from "@/services/audit-compliance.service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const events = await auditComplianceService.getSecurityEvents({
      severity,
      status,
      search,
    });

    return NextResponse.json({ success: true, data: events }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch security events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const event = await auditComplianceService.createSecurityEvent(body);
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to log security event" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { id, resolutionNotes, resolvedBy } = body;
    if (!id || !resolutionNotes) {
      return NextResponse.json(
        { success: false, message: "Event ID and resolution notes are required" },
        { status: 400 }
      );
    }

    const updated = await auditComplianceService.resolveSecurityEvent(
      id,
      resolutionNotes,
      resolvedBy
    );
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update security event" },
      { status: 500 }
    );
  }
}
