import { NextRequest, NextResponse } from "next/server";
import DoctorController from "@/controllers/doctor.controller";

/**
 * @route POST /api/doctor
 * @desc Create a new doctor
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return DoctorController.createDoctor(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create doctor"
        }, { status: 500 });
    }
}

/**
 * @route GET /api/doctor
 * @desc Get all doctors (supports ?departmentId=...)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return DoctorController.getDoctors(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch doctors"
        }, { status: 500 });
    }
}
