import { NextRequest, NextResponse } from "next/server";
import DepartmentController from "@/controllers/department.controller";

type Params = { params: Promise<{ id: string }> };

/**
 * @route GET /api/department/:id
 * @desc Get a department by ID
 */
export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return DepartmentController.getDepartmentById(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch department"
        }, { status: 500 });
    }
}

/**
 * @route PUT /api/department/:id
 * @desc Update a department by ID
 */
export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return DepartmentController.updateDepartment(request, id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to update department"
        }, { status: 500 });
    }
}

/**
 * @route DELETE /api/department/:id
 * @desc Delete a department by ID
 */
export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return DepartmentController.deleteDepartment(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to delete department"
        }, { status: 500 });
    }
}
