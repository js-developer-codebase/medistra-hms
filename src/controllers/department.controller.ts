import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultDepartmentService, { DepartmentService } from "@/services/department.service";
import { CreateDepartmentDto, UpdateDepartmentDto } from "@/dto/department.dto";

export class DepartmentController {
    constructor(private departmentService: DepartmentService = defaultDepartmentService) { }

    async createDepartment(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateDepartmentDto = await request.json();

            if (!data.code || !data.organizationId) {
                return NextResponse.json(
                    { success: false, message: "Fields 'code' and 'organizationId' are required" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.organizationId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid organization ID format" },
                    { status: 400 }
                );
            }

            const department = await this.departmentService.createDepartment(data);

            return NextResponse.json(
                { success: true, message: "Department created successfully", data: department },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create department" },
                { status: statusCode }
            );
        }
    }

    async getDepartments(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            
            // Check if organizationId is provided in query params
            const { searchParams } = new URL(request.url);
            const organizationId = searchParams.get('organizationId');
            
            let departments;
            
            if (organizationId) {
                 if (!Types.ObjectId.isValid(organizationId)) {
                    return NextResponse.json(
                        { success: false, message: "Invalid organization ID" },
                        { status: 400 }
                    );
                }
                departments = await this.departmentService.getDepartmentsByOrganizationId(new Types.ObjectId(organizationId));
            } else {
                departments = await this.departmentService.getAllDepartments();
            }

            return NextResponse.json(
                { success: true, count: departments.length, data: departments },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch departments" },
                { status: 500 }
            );
        }
    }

    async getDepartmentById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid department ID" },
                    { status: 400 }
                );
            }

            const department = await this.departmentService.getDepartmentById(new Types.ObjectId(id));
            if (!department) {
                return NextResponse.json(
                    { success: false, message: "Department not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: department },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch department" },
                { status: 500 }
            );
        }
    }

    async updateDepartment(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid department ID" },
                    { status: 400 }
                );
            }

            const data: UpdateDepartmentDto = await request.json();
            
            if (data.organizationId && !Types.ObjectId.isValid(data.organizationId)) {
                 return NextResponse.json(
                    { success: false, message: "Invalid organization ID format" },
                    { status: 400 }
                );
            }
            
            const department = await this.departmentService.updateDepartment(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "Department updated successfully", data: department },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update department" },
                { status: statusCode }
            );
        }
    }

    async deleteDepartment(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid department ID" },
                    { status: 400 }
                );
            }

            await this.departmentService.deleteDepartment(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Department deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete department" },
                { status: statusCode }
            );
        }
    }
}

export default new DepartmentController();
