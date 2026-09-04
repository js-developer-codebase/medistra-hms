import { NextRequest, NextResponse } from "next/server";
import AdmissionController from "@/controllers/admission.controller";

export async function GET(): Promise<NextResponse> {
    try {
        return await AdmissionController.getAdmissionStats();
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch admission statistics"
        }, { status: 500 });
    }
}
