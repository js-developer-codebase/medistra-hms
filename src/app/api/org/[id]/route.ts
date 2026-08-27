import { NextRequest, NextResponse } from "next/server";
import OrganizationController from "@/controllers/organization.controller";

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    return OrganizationController.updateOrganization(request, context);
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    return OrganizationController.deleteOrganization(request, context);
}
