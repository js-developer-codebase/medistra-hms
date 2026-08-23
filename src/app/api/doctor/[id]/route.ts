import { NextRequest, NextResponse } from "next/server";
import DoctorController from "@/controllers/doctor.controller";

type Params = { params: Promise<{ id: string }> };

/**
 * @route GET /api/doctor/:id
 * @desc Get a doctor by ID
 */
export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return DoctorController.getDoctorById(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch doctor"
        }, { status: 500 });
    }
}

/**
 * @route PUT /api/doctor/:id
 * @desc Update a doctor by ID
 */
export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return DoctorController.updateDoctor(request, id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to update doctor"
        }, { status: 500 });
    }
}

/**
 * @route DELETE /api/doctor/:id
 * @desc Delete a doctor by ID
 */
export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return DoctorController.deleteDoctor(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to delete doctor"
        }, { status: 500 });
    }
}
