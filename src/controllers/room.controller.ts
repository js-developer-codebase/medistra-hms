import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import roomService, { RoomService } from "@/services/room.service";
import { CreateRoomDto, UpdateRoomDto } from "@/dto/room.dto";

export class RoomController {
    constructor(private roomService: RoomService = roomService) { }

    async createRoom(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateRoomDto = await request.json();

            if (!data.roomNumber || !data.wardId) {
                return NextResponse.json(
                    { success: false, message: "Fields 'roomNumber' and 'wardId' are required" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.wardId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid ward ID format" },
                    { status: 400 }
                );
            }

            const room = await this.roomService.createRoom(data);

            return NextResponse.json(
                { success: true, message: "Room created successfully", data: room },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create room" },
                { status: statusCode }
            );
        }
    }

    async getRooms(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            
            const { searchParams } = new URL(request.url);
            const wardId = searchParams.get('wardId');
            
            let rooms;
            
            if (wardId) {
                 if (!Types.ObjectId.isValid(wardId)) {
                    return NextResponse.json(
                        { success: false, message: "Invalid ward ID" },
                        { status: 400 }
                    );
                }
                rooms = await this.roomService.getRoomsByWardId(new Types.ObjectId(wardId));
            } else {
                rooms = await this.roomService.getAllRooms();
            }

            return NextResponse.json(
                { success: true, count: rooms.length, data: rooms },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch rooms" },
                { status: 500 }
            );
        }
    }

    async getRoomById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid room ID" },
                    { status: 400 }
                );
            }

            const room = await this.roomService.getRoomById(new Types.ObjectId(id));
            if (!room) {
                return NextResponse.json(
                    { success: false, message: "Room not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: room },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch room" },
                { status: 500 }
            );
        }
    }

    async updateRoom(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid room ID" },
                    { status: 400 }
                );
            }

            const data: UpdateRoomDto = await request.json();
            
            if (data.wardId && !Types.ObjectId.isValid(data.wardId)) {
                 return NextResponse.json(
                    { success: false, message: "Invalid ward ID format" },
                    { status: 400 }
                );
            }
            
            const room = await this.roomService.updateRoom(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "Room updated successfully", data: room },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update room" },
                { status: statusCode }
            );
        }
    }

    async deleteRoom(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid room ID" },
                    { status: 400 }
                );
            }

            await this.roomService.deleteRoom(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Room deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete room" },
                { status: statusCode }
            );
        }
    }
}

export default new RoomController();
