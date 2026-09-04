import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultDepartmentService, { DepartmentService } from "@/services/department.service";
import { CreateDepartmentDto, UpdateDepartmentDto } from "@/dto/department.dto";
import Organization from "@/models/organization.model";
import Doctor from "@/models/doctor.model";
import Staff from "@/models/staff.model";
import Department from "@/models/department.model";

export class DepartmentController {
    constructor(private departmentService: DepartmentService = defaultDepartmentService) { }

    async createDepartment(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: any = await request.json();

            if (!data.code || !data.name) {
                return NextResponse.json(
                    { success: false, message: "Department Name and Code are required" },
                    { status: 400 }
                );
            }

            // Ensure organizationId exists or auto-resolve
            if (!data.organizationId || !Types.ObjectId.isValid(data.organizationId)) {
                let org = await Organization.findOne();
                if (!org) {
                    org = await Organization.create({
                        organizationName: "Medistra Central Hospital",
                        organizationId: "ORG-001",
                        organizationType: "HOSPITAL",
                        branchType: "MAIN",
                        isActive: true
                    });
                }
                data.organizationId = org._id;
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
            if (!Doctor) {}
            if (!Staff) {}
            
            const { searchParams } = new URL(request.url);
            const organizationId = searchParams.get('organizationId');
            const search = searchParams.get('search')?.toLowerCase().trim();
            
            let departments = await this.departmentService.getAllDepartments();

            if (organizationId && Types.ObjectId.isValid(organizationId)) {
                departments = departments.filter((d: any) =>
                    d.organizationId && (d.organizationId._id?.toString() === organizationId || d.organizationId.toString() === organizationId)
                );
            }

            // Calculate doctor and staff count for each department
            const allDoctors = await Doctor.find().lean();
            const allStaff = await Staff.find().lean();

            let enriched = departments.map((dept: any) => {
                const deptIdStr = dept._id.toString();
                const docCount = allDoctors.filter((doc: any) =>
                    doc.departmentId && (doc.departmentId.toString() === deptIdStr || doc.departmentId._id?.toString() === deptIdStr)
                ).length;
                const staffCount = allStaff.filter((st: any) =>
                    st.departmentId && (st.departmentId.toString() === deptIdStr || st.departmentId._id?.toString() === deptIdStr)
                ).length;

                return {
                    ...dept,
                    doctorCount: docCount,
                    staffCount: staffCount,
                };
            });

            if (search) {
                enriched = enriched.filter((dept: any) => {
                    return (
                        dept.name?.toLowerCase().includes(search) ||
                        dept.code?.toLowerCase().includes(search) ||
                        dept.location?.toLowerCase().includes(search) ||
                        dept.description?.toLowerCase().includes(search)
                    );
                });
            }

            return NextResponse.json(
                { success: true, count: enriched.length, data: enriched },
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
