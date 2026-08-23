import { NextRequest, NextResponse } from "next/server";
import RoomController from "@/controllers/room.controller";

type Params = { params: Promise<{ id: string }> };

/**
 * @route GET /api/room/:id
 * @desc Get a room by ID
 */
export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return RoomController.getRoomById(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch room"
        }, { status: 500 });
    }
}

/**
 * @route PUT /api/room/:id
 * @desc Update a room by ID
 */
export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return RoomController.updateRoom(request, id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to update room"
        }, { status: 500 });
    }
}

/**
 * @route DELETE /api/room/:id
 * @desc Delete a room by ID
 */
export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return RoomController.deleteRoom(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to delete room"
        }, { status: 500 });
    }
}
