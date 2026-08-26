import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultConfigService, { ConfigService } from "@/services/config.service";

export class ConfigController {
    constructor(private configService: ConfigService = defaultConfigService) { }

    async getSettings(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const settings = await this.configService.getSettings();
            return NextResponse.json({ success: true, data: settings }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch settings" },
                { status: 500 }
            );
        }
    }

    async createSetting(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data = await request.json();
            const setting = await this.configService.createSetting(data);
            return NextResponse.json({ success: true, data: setting }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create setting" },
                { status: 500 }
            );
        }
    }

    async updateSetting(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();
            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json({ success: false, message: "Invalid ID format" }, { status: 400 });
            }
            const data = await request.json();
            const setting = await this.configService.updateSetting(new Types.ObjectId(id), data);
            return NextResponse.json({ success: true, data: setting }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update setting" },
                { status: error?.statusCode || 500 }
            );
        }
    }

    async deleteSetting(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();
            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json({ success: false, message: "Invalid ID format" }, { status: 400 });
            }
            await this.configService.deleteSetting(new Types.ObjectId(id));
            return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete setting" },
                { status: error?.statusCode || 500 }
            );
        }
    }
}

export default new ConfigController();
