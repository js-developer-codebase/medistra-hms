import { NextRequest, NextResponse } from "next/server";
import RoomController from "@/controllers/room.controller";

/**
 * @route POST /api/room
 * @desc Create a new room
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return RoomController.createRoom(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create room"
        }, { status: 500 });
    }
}

/**
 * @route GET /api/room
 * @desc Get all rooms (supports ?wardId=...)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return RoomController.getRooms(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch rooms"
        }, { status: 500 });
    }
}
