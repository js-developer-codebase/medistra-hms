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
}

export default new OrganizationController();