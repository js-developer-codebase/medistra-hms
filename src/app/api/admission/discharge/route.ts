import { NextRequest, NextResponse } from "next/server";
import AdmissionController from "@/controllers/admission.controller";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return await AdmissionController.dischargePatient(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to discharge patient"
        }, { status: 500 });
    }
}
