import { NextRequest, NextResponse } from "next/server";
import PatientController from "@/controllers/patient.controller";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return PatientController.mergePatients(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to merge patients"
        }, { status: 500 });
    }
}
