import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultAdmissionService, { AdmissionService } from "@/services/admission.service";
import { CreateAdmissionDto, UpdateAdmissionDto } from "@/dto/admission.dto";

export class AdmissionController {
    constructor(private admissionService: AdmissionService = defaultAdmissionService) { }

    async createAdmission(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateAdmissionDto = await request.json();

            if (!data.patientId || !data.doctorId || !data.branchId || !data.bedId || !data.admissionDate || !data.status) {
                return NextResponse.json(
                    { success: false, message: "Required fields are missing" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.patientId) || !Types.ObjectId.isValid(data.doctorId) || !Types.ObjectId.isValid(data.branchId) || !Types.ObjectId.isValid(data.bedId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid ID format for patient, doctor, branch, or bed" },
                    { status: 400 }
                );
            }

            const admission = await this.admissionService.createAdmission(data);

            return NextResponse.json(
                { success: true, message: "Admission created successfully", data: admission },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create admission" },
                { status: statusCode }
            );
        }
    }

    async getAdmissions(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();

            const { searchParams } = new URL(request.url);
            const branchId = searchParams.get('branchId');
            const patientId = searchParams.get('patientId');
            const doctorId = searchParams.get('doctorId');
            const bedId = searchParams.get('bedId');

            let admissions;

            if (branchId) {
                if (!Types.ObjectId.isValid(branchId)) return NextResponse.json({ success: false, message: "Invalid branch ID" }, { status: 400 });
                admissions = await this.admissionService.getAdmissionsByBranchId(new Types.ObjectId(branchId));
            } else if (patientId) {
                if (!Types.ObjectId.isValid(patientId)) return NextResponse.json({ success: false, message: "Invalid patient ID" }, { status: 400 });
                admissions = await this.admissionService.getAdmissionsByPatientId(new Types.ObjectId(patientId));
            } else if (doctorId) {
                if (!Types.ObjectId.isValid(doctorId)) return NextResponse.json({ success: false, message: "Invalid doctor ID" }, { status: 400 });
                admissions = await this.admissionService.getAdmissionsByDoctorId(new Types.ObjectId(doctorId));
            } else if (bedId) {
                if (!Types.ObjectId.isValid(bedId)) return NextResponse.json({ success: false, message: "Invalid bed ID" }, { status: 400 });
                admissions = await this.admissionService.getAdmissionsByBedId(new Types.ObjectId(bedId));
            } else {
                admissions = await this.admissionService.getAllAdmissions();
            }

            return NextResponse.json(
                { success: true, count: admissions.length, data: admissions },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch admissions" },
                { status: 500 }
            );
        }
    }

    async getAdmissionById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid admission ID" },
                    { status: 400 }
                );
            }

            const admission = await this.admissionService.getAdmissionById(new Types.ObjectId(id));
            if (!admission) {
                return NextResponse.json(
                    { success: false, message: "Admission not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: admission },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch admission" },
                { status: 500 }
            );
        }
    }

    async updateAdmission(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid admission ID" },
                    { status: 400 }
                );
            }

            const data: UpdateAdmissionDto = await request.json();

            if ((data.patientId && !Types.ObjectId.isValid(data.patientId)) ||
                (data.doctorId && !Types.ObjectId.isValid(data.doctorId)) ||
                (data.branchId && !Types.ObjectId.isValid(data.branchId)) ||
                (data.bedId && !Types.ObjectId.isValid(data.bedId))) {
                return NextResponse.json(
                    { success: false, message: "Invalid ID format for patient, doctor, branch, or bed" },
                    { status: 400 }
                );
            }

            const admission = await this.admissionService.updateAdmission(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "Admission updated successfully", data: admission },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update admission" },
                { status: statusCode }
            );
        }
    }

    async deleteAdmission(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid admission ID" },
                    { status: 400 }
                );
            }

            await this.admissionService.deleteAdmission(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Admission deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete admission" },
                { status: statusCode }
            );
        }
    }
}

export default new AdmissionController();
