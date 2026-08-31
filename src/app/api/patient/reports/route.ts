import { NextRequest, NextResponse } from "next/server";
import PatientController from "@/controllers/patient.controller";

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return PatientController.getStats(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch patient reports"
        }, { status: 500 });
    }
}
