import { NextRequest, NextResponse } from "next/server";
import BedController from "@/controllers/bed.controller";

/**
 * @route POST /api/bed
 * @desc Create a new bed
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return BedController.createBed(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create bed"
        }, { status: 500 });
    }
}

/**
 * @route GET /api/bed
 * @desc Get all beds (supports ?roomId=...)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return BedController.getBeds(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch beds"
        }, { status: 500 });
    }
}
