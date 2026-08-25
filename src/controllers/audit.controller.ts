import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import defaultAuditService, { AuditService } from "@/services/audit.service";

export class AuditController {
    constructor(private auditService: AuditService = defaultAuditService) { }

    async getLogs(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const logs = await this.auditService.getAuditLogs();
            return NextResponse.json({ success: true, data: logs }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch audit logs" },
                { status: 500 }
            );
        }
    }

    async getSecurityEvents(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const events = await this.auditService.getSecurityEvents();
            return NextResponse.json({ success: true, data: events }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch security events" },
                { status: 500 }
            );
        }
    }
}

export default new AuditController();
