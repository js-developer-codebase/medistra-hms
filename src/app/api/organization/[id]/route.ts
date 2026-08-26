import { NextRequest, NextResponse } from "next/server";
import OrganizationController from "@/controllers/organization.controller";

/**
 * @route PUT /api/org/[id]
 * @desc Update an organization
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        return OrganizationController.updateOrganization(request, { params });
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to update organization"
        }, { status: 500 });
    }
}

/**
 * @route DELETE /api/org/[id]
 * @desc Delete an organization
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        return OrganizationController.deleteOrganization(request, { params });
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to delete organization"
        }, { status: 500 });
    }
}
