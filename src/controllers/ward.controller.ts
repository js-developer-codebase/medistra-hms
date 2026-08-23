import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import wardService, { WardService } from "@/services/ward.service";
import { CreateWardDto, UpdateWardDto } from "@/dto/ward.dto";

export class WardController {
    constructor(private wardService: WardService = wardService) { }

    async createWard(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateWardDto = await request.json();

            if (!data.wardName || !data.wardCode || data.floor === undefined || !data.organizationId) {
                return NextResponse.json(
                    { success: false, message: "Fields 'wardName', 'wardCode', 'floor', and 'organizationId' are required" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.organizationId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid organization ID format" },
                    { status: 400 }
                );
            }

            const ward = await this.wardService.createWard(data);

            return NextResponse.json(
                { success: true, message: "Ward created successfully", data: ward },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create ward" },
                { status: statusCode }
            );
        }
    }

    async getWards(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            
            const { searchParams } = new URL(request.url);
            const organizationId = searchParams.get('organizationId');
            
            let wards;
            
            if (organizationId) {
                 if (!Types.ObjectId.isValid(organizationId)) {
                    return NextResponse.json(
                        { success: false, message: "Invalid organization ID" },
                        { status: 400 }
                    );
                }
                wards = await this.wardService.getWardsByOrganizationId(new Types.ObjectId(organizationId));
            } else {
                wards = await this.wardService.getAllWards();
            }

            return NextResponse.json(
                { success: true, count: wards.length, data: wards },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch wards" },
                { status: 500 }
            );
        }
    }

    async getWardById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid ward ID" },
                    { status: 400 }
                );
            }

            const ward = await this.wardService.getWardById(new Types.ObjectId(id));
            if (!ward) {
                return NextResponse.json(
                    { success: false, message: "Ward not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: ward },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch ward" },
                { status: 500 }
            );
        }
    }

    async updateWard(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid ward ID" },
                    { status: 400 }
                );
            }

            const data: UpdateWardDto = await request.json();
            
            if (data.organizationId && !Types.ObjectId.isValid(data.organizationId)) {
                 return NextResponse.json(
                    { success: false, message: "Invalid organization ID format" },
                    { status: 400 }
                );
            }
            
            const ward = await this.wardService.updateWard(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "Ward updated successfully", data: ward },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update ward" },
                { status: statusCode }
            );
        }
    }

    async deleteWard(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid ward ID" },
                    { status: 400 }
                );
            }

            await this.wardService.deleteWard(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Ward deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete ward" },
                { status: statusCode }
            );
        }
    }
}

export default new WardController();
