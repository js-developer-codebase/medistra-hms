import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import bedService, { BedService } from "@/services/bed.service";
import { CreateBedDto, UpdateBedDto } from "@/dto/bed.dto";

export class BedController {
    constructor(private bedService: BedService = bedService) { }

    async createBed(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateBedDto = await request.json();

            if (!data.bedNumber || !data.roomId) {
                return NextResponse.json(
                    { success: false, message: "Fields 'bedNumber' and 'roomId' are required" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.roomId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid room ID format" },
                    { status: 400 }
                );
            }

            const bed = await this.bedService.createBed(data);

            return NextResponse.json(
                { success: true, message: "Bed created successfully", data: bed },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create bed" },
                { status: statusCode }
            );
        }
    }

    async getBeds(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            
            const { searchParams } = new URL(request.url);
            const roomId = searchParams.get('roomId');
            
            let beds;
            
            if (roomId) {
                 if (!Types.ObjectId.isValid(roomId)) {
                    return NextResponse.json(
                        { success: false, message: "Invalid room ID" },
                        { status: 400 }
                    );
                }
                beds = await this.bedService.getBedsByRoomId(new Types.ObjectId(roomId));
            } else {
                beds = await this.bedService.getAllBeds();
            }

            return NextResponse.json(
                { success: true, count: beds.length, data: beds },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch beds" },
                { status: 500 }
            );
        }
    }

    async getBedById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid bed ID" },
                    { status: 400 }
                );
            }

            const bed = await this.bedService.getBedById(new Types.ObjectId(id));
            if (!bed) {
                return NextResponse.json(
                    { success: false, message: "Bed not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: bed },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch bed" },
                { status: 500 }
            );
        }
    }

    async updateBed(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid bed ID" },
                    { status: 400 }
                );
            }

            const data: UpdateBedDto = await request.json();
            
            if (data.roomId && !Types.ObjectId.isValid(data.roomId)) {
                 return NextResponse.json(
                    { success: false, message: "Invalid room ID format" },
                    { status: 400 }
                );
            }
            
            const bed = await this.bedService.updateBed(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "Bed updated successfully", data: bed },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update bed" },
                { status: statusCode }
            );
        }
    }

    async deleteBed(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid bed ID" },
                    { status: 400 }
                );
            }

            await this.bedService.deleteBed(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Bed deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete bed" },
                { status: statusCode }
            );
        }
    }
}

export default new BedController();
