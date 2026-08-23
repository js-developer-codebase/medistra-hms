import { NextRequest, NextResponse } from "next/server";
import UserController from "@/controllers/user.controller";

type Params = { params: Promise<{ id: string }> };

/**
 * @route GET /api/user/:id
 * @desc Get a user by ID
 */
export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return UserController.getUserById(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch user"
        }, { status: 500 });
    }
}

/**
 * @route PUT /api/user/:id
 * @desc Update a user by ID
 */
export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return UserController.updateUser(request, id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to update user"
        }, { status: 500 });
    }
}

/**
 * @route DELETE /api/user/:id
 * @desc Delete a user by ID
 */
export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return UserController.deleteUser(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to delete user"
        }, { status: 500 });
    }
}
