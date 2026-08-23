import { NextRequest, NextResponse } from "next/server";
import PatientController from "@/controllers/patient.controller";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return PatientController.createPatient(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create patient"
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return PatientController.getPatients(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch patients"
        }, { status: 500 });
    }
}
