import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

/**
 * @route POST /api/org
 * @desc Create a new organization
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        await dbConnect();
        const body = await request.json();
        return NextResponse.json({
            success: true,
            message: "Organization created successfully",
            data: body
        }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create organization"
        }, { status: 500 });
    }
}