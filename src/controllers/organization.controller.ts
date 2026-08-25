import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import defaultOrganizationService, { OrganizationService } from "@/services/organization.service";
import { CreateOrganizationDto } from "@/dto/organization.dto";

export class OrganizationController {
    constructor(private organizationService: OrganizationService = defaultOrganizationService) { }

    async createOrganization(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateOrganizationDto = await request.json();
            const organizationId = uuidv4();
            data.organizationId = organizationId;
            if (data.headQuarter) {
                const parentOrganization = await this.organizationService.getOrganizationById(data.headQuarter);
                if (!parentOrganization) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Parent organization not found"
                        },
                        { status: 404 }
                    );
                }
            }
            const organization = await this.organizationService.createOrganization(data);

            return NextResponse.json(
                {
                    success: true,
                    message: "Organization created successfuly",
                    data: organization
                },
                { status: 201 }
            );
        } catch (error: any) {
            return NextResponse.json(
                {
                    success: false,
                    message: error?.message || "Failed to create organization"
                },
                { status: 500 }
            );
        }
    }

    async getOrganizations(): Promise<NextResponse> {
        try {
            await dbConnect();
            const organizations = await this.organizationService.getAllOrganizations();
            return NextResponse.json(
                {
                    success: true,
                    count: organizations.length,
                    data: organizations
                },
                { status: 200 }
            );
        } catch (error: any) {
            console.error("OrganizationController getOrganizations Error:", error);
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                {
                    success: false,
                    message: error?.message || "Failed to fetch organizations"
                },
                { status: statusCode }
            );
        }
    }

    async updateOrganization(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
        try {
            await dbConnect();
            const { id } = await params;
            const data = await request.json();
            
            // Validate id
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return NextResponse.json({ success: false, message: "Invalid organization ID format" }, { status: 400 });
            }

            const updatedOrg = await this.organizationService.updateOrganization(id as any, data);
            
            if (!updatedOrg) {
                return NextResponse.json({ success: false, message: "Organization not found" }, { status: 404 });
            }

            return NextResponse.json({ success: true, message: "Organization updated successfully", data: updatedOrg }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error?.message || "Failed to update organization" }, { status: 500 });
        }
    }

    async deleteOrganization(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
        try {
            await dbConnect();
            const { id } = await params;

            // Validate id
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return NextResponse.json({ success: false, message: "Invalid organization ID format" }, { status: 400 });
            }

            const deletedOrg = await this.organizationService.deleteOrganization(id as any);
            
            if (!deletedOrg) {
                return NextResponse.json({ success: false, message: "Organization not found" }, { status: 404 });
            }

            return NextResponse.json({ success: true, message: "Organization deleted successfully", data: deletedOrg }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error?.message || "Failed to delete organization" }, { status: 500 });
        }
    }
}

export default new OrganizationController();