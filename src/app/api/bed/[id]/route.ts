import { NextRequest, NextResponse } from "next/server";
import BedController from "@/controllers/bed.controller";

type Params = { params: Promise<{ id: string }> };

/**
 * @route GET /api/bed/:id
 * @desc Get a bed by ID
 */
export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return BedController.getBedById(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch bed"
        }, { status: 500 });
    }
}

/**
 * @route PUT /api/bed/:id
 * @desc Update a bed by ID
 */
export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return BedController.updateBed(request, id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to update bed"
        }, { status: 500 });
    }
}

/**
 * @route DELETE /api/bed/:id
 * @desc Delete a bed by ID
 */
export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return BedController.deleteBed(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to delete bed"
        }, { status: 500 });
    }
}
