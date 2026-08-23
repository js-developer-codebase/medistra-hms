import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import patientService, { PatientService } from "@/services/patient.service";
import { CreatePatientDto, UpdatePatientDto } from "@/dto/patient.dto";

export class PatientController {
    constructor(private patientService: PatientService = patientService) { }

    async createPatient(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreatePatientDto = await request.json();

            if (!data.name || !data.age || !data.gender || !data.contact || !data.address || !data.emergencyContact || !data.branchId) {
                return NextResponse.json(
                    { success: false, message: "Required fields are missing" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.branchId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid branch ID format" },
                    { status: 400 }
                );
            }

            const patient = await this.patientService.createPatient(data);

            return NextResponse.json(
                { success: true, message: "Patient created successfully", data: patient },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create patient" },
                { status: statusCode }
            );
        }
    }

    async getPatients(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();

            const { searchParams } = new URL(request.url);
            const branchId = searchParams.get('branchId');

            let patients;

            if (branchId) {
                if (!Types.ObjectId.isValid(branchId)) {
                    return NextResponse.json(
                        { success: false, message: "Invalid branch ID" },
                        { status: 400 }
                    );
                }
                patients = await this.patientService.getPatientsByBranchId(new Types.ObjectId(branchId));
            } else {
                patients = await this.patientService.getAllPatients();
            }

            return NextResponse.json(
                { success: true, count: patients.length, data: patients },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch patients" },
                { status: 500 }
            );
        }
    }

    async getPatientById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid patient ID" },
                    { status: 400 }
                );
            }

            const patient = await this.patientService.getPatientById(new Types.ObjectId(id));
            if (!patient) {
                return NextResponse.json(
                    { success: false, message: "Patient not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: patient },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch patient" },
                { status: 500 }
            );
        }
    }

    async updatePatient(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid patient ID" },
                    { status: 400 }
                );
            }

            const data: UpdatePatientDto = await request.json();

            if (data.branchId && !Types.ObjectId.isValid(data.branchId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid branch ID format" },
                    { status: 400 }
                );
            }

            const patient = await this.patientService.updatePatient(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "Patient updated successfully", data: patient },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update patient" },
                { status: statusCode }
            );
        }
    }

    async deletePatient(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid patient ID" },
                    { status: 400 }
                );
            }

            await this.patientService.deletePatient(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Patient deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete patient" },
                { status: statusCode }
            );
        }
    }
}

export default new PatientController();
