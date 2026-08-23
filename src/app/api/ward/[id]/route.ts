import { NextRequest, NextResponse } from "next/server";
import WardController from "@/controllers/ward.controller";

type Params = { params: Promise<{ id: string }> };

/**
 * @route GET /api/ward/:id
 * @desc Get a ward by ID
 */
export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return WardController.getWardById(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch ward"
        }, { status: 500 });
    }
}

/**
 * @route PUT /api/ward/:id
 * @desc Update a ward by ID
 */
export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return WardController.updateWard(request, id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to update ward"
        }, { status: 500 });
    }
}

/**
 * @route DELETE /api/ward/:id
 * @desc Delete a ward by ID
 */
export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return WardController.deleteWard(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to delete ward"
        }, { status: 500 });
    }
}
