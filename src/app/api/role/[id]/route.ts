import { NextRequest, NextResponse } from "next/server";
import RoleController from "@/controllers/role.controller";

type Params = { params: Promise<{ id: string }> };

/**
 * @route GET /api/role/:id
 * @desc Get a role by ID
 */
export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return RoleController.getRoleById(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch role"
        }, { status: 500 });
    }
}

/**
 * @route PUT /api/role/:id
 * @desc Update a role by ID
 */
export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return RoleController.updateRole(request, id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to update role"
        }, { status: 500 });
    }
}

/**
 * @route DELETE /api/role/:id
 * @desc Delete a role by ID
 */
export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return RoleController.deleteRole(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to delete role"
        }, { status: 500 });
    }
}
