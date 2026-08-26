import { NextRequest, NextResponse } from "next/server";
import OrganizationController from "@/controllers/organization.controller";

/**
 * @route POST /api/org
 * @desc Create a new organization
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return OrganizationController.createOrganization(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create organization"
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return OrganizationController.getOrganizations();
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch organizations"
        }, { status: 500 });
    }
}