import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultDoctorService, { DoctorService } from "@/services/doctor.service";
import { CreateDoctorDto, UpdateDoctorDto } from "@/dto/doctor.dto";

export class DoctorController {
    constructor(private doctorService: DoctorService = defaultDoctorService) { }

    async createDoctor(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateDoctorDto = await request.json();

            if (!data.userId || !data.departmentId || !data.licenseNo) {
                return NextResponse.json(
                    { success: false, message: "Fields 'userId', 'departmentId', and 'licenseNo' are required" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.userId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid user ID format" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.departmentId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid department ID format" },
                    { status: 400 }
                );
            }

            const doctor = await this.doctorService.createDoctor(data);

            return NextResponse.json(
                { success: true, message: "Doctor created successfully", data: doctor },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create doctor" },
                { status: statusCode }
            );
        }
    }

    async getDoctors(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();

            const { searchParams } = new URL(request.url);
            const departmentId = searchParams.get('departmentId');

            let doctors;

            if (departmentId) {
                if (!Types.ObjectId.isValid(departmentId)) {
                    return NextResponse.json(
                        { success: false, message: "Invalid department ID" },
                        { status: 400 }
                    );
                }
                doctors = await this.doctorService.getDoctorsByDepartmentId(new Types.ObjectId(departmentId));
            } else {
                doctors = await this.doctorService.getAllDoctors();
            }

            return NextResponse.json(
                { success: true, count: doctors.length, data: doctors },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch doctors" },
                { status: 500 }
            );
        }
    }

    async getDoctorById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid doctor ID" },
                    { status: 400 }
                );
            }

            const doctor = await this.doctorService.getDoctorById(new Types.ObjectId(id));
            if (!doctor) {
                return NextResponse.json(
                    { success: false, message: "Doctor not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: doctor },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch doctor" },
                { status: 500 }
            );
        }
    }

    async updateDoctor(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid doctor ID" },
                    { status: 400 }
                );
            }

            const data: UpdateDoctorDto = await request.json();

            if (data.userId && !Types.ObjectId.isValid(data.userId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid user ID format" },
                    { status: 400 }
                );
            }

            if (data.departmentId && !Types.ObjectId.isValid(data.departmentId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid department ID format" },
                    { status: 400 }
                );
            }

            const doctor = await this.doctorService.updateDoctor(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "Doctor updated successfully", data: doctor },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update doctor" },
                { status: statusCode }
            );
        }
    }

    async deleteDoctor(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid doctor ID" },
                    { status: 400 }
                );
            }

            await this.doctorService.deleteDoctor(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Doctor deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete doctor" },
                { status: statusCode }
            );
        }
    }
}

export default new DoctorController();
