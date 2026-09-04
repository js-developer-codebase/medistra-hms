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

            if (!data.patientId || !data.doctorId || !data.bedId || !data.admissionDate) {
                return NextResponse.json(
                    { success: false, message: "Patient, Doctor, Bed, and Admission Date are required" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.patientId.toString()) || 
                !Types.ObjectId.isValid(data.doctorId.toString()) || 
                !Types.ObjectId.isValid(data.bedId.toString())) {
                return NextResponse.json(
                    { success: false, message: "Invalid ID format for patient, doctor, or bed" },
                    { status: 400 }
                );
            }

            if (data.branchId && !Types.ObjectId.isValid(data.branchId.toString())) {
                return NextResponse.json(
                    { success: false, message: "Invalid ID format for branch" },
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
            const status = searchParams.get('status');
            const type = searchParams.get('type');

            const filter: any = {};

            if (status) {
                if (status === "ACTIVE") {
                    filter.status = { $in: ["ADMITTED", "TRANSFERRED"] };
                } else if (status !== "ALL") {
                    filter.status = status;
                }
            }

            if (type && type !== "ALL") {
                filter.admissionType = type;
            }

            if (branchId) {
                if (!Types.ObjectId.isValid(branchId)) return NextResponse.json({ success: false, message: "Invalid branch ID" }, { status: 400 });
                filter.branchId = new Types.ObjectId(branchId);
            }

            if (patientId) {
                if (!Types.ObjectId.isValid(patientId)) return NextResponse.json({ success: false, message: "Invalid patient ID" }, { status: 400 });
                filter.patientId = new Types.ObjectId(patientId);
            }

            if (doctorId) {
                if (!Types.ObjectId.isValid(doctorId)) return NextResponse.json({ success: false, message: "Invalid doctor ID" }, { status: 400 });
                filter.doctorId = new Types.ObjectId(doctorId);
            }

            if (bedId) {
                if (!Types.ObjectId.isValid(bedId)) return NextResponse.json({ success: false, message: "Invalid bed ID" }, { status: 400 });
                filter.bedId = new Types.ObjectId(bedId);
            }

            const admissions = await this.admissionService.getAllAdmissions(filter);

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

    async transferPatient(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data = await request.json();

            if (!data.admissionId || !data.newBedId || !data.reason) {
                return NextResponse.json(
                    { success: false, message: "Admission ID, Target Bed ID, and Reason are required" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.admissionId) || !Types.ObjectId.isValid(data.newBedId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid ID format for admission or destination bed" },
                    { status: 400 }
                );
            }

            const admission = await this.admissionService.transferPatient(data);

            return NextResponse.json(
                { success: true, message: "Patient transferred successfully", data: admission },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to transfer patient" },
                { status: statusCode }
            );
        }
    }

    async dischargePatient(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data = await request.json();

            if (!data.admissionId || !data.dischargeCondition || !data.finalDiagnosis) {
                return NextResponse.json(
                    { success: false, message: "Admission ID, Discharge Condition, and Final Diagnosis are required" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.admissionId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid admission ID format" },
                    { status: 400 }
                );
            }

            const admission = await this.admissionService.dischargePatient(data);

            return NextResponse.json(
                { success: true, message: "Patient discharged successfully", data: admission },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to discharge patient" },
                { status: statusCode }
            );
        }
    }

    async getAdmissionStats(): Promise<NextResponse> {
        try {
            await dbConnect();
            const stats = await this.admissionService.getAdmissionStats();
            return NextResponse.json(
                { success: true, data: stats },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch admission statistics" },
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

            if ((data.patientId && !Types.ObjectId.isValid(data.patientId.toString())) ||
                (data.doctorId && !Types.ObjectId.isValid(data.doctorId.toString())) ||
                (data.branchId && !Types.ObjectId.isValid(data.branchId.toString())) ||
                (data.bedId && !Types.ObjectId.isValid(data.bedId.toString()))) {
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
