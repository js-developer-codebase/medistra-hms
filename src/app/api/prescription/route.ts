import { NextRequest, NextResponse } from "next/server";
import PrescriptionController from "@/controllers/prescription.controller";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return PrescriptionController.createPrescription(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create prescription"
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return PrescriptionController.getPrescriptions(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch prescriptions"
        }, { status: 500 });
    }
}
