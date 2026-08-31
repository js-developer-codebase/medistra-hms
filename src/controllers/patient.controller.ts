import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultPatientService, { PatientService } from "@/services/patient.service";
import { CreatePatientDto, UpdatePatientDto, AddPatientDocumentDto, MergePatientDto } from "@/dto/patient.dto";

export class PatientController {
    constructor(private patientService: PatientService = defaultPatientService) { }

    async createPatient(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreatePatientDto = await request.json();

            if (!data.name || data.age === undefined || !data.gender || !data.contact || !data.address || !data.emergencyContact || !data.branchId) {
                return NextResponse.json(
                    { success: false, message: "Required fields are missing: Name, Age, Gender, Contact, Address, Emergency Contact, and Branch are required." },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.branchId.toString())) {
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
            const query = searchParams.get("query") || undefined;
            const branchId = searchParams.get("branchId") || undefined;
            const status = searchParams.get("status") || undefined;
            const bloodGroup = searchParams.get("bloodGroup") || undefined;

            const patients = await this.patientService.searchPatients({
                query,
                branchId,
                status,
                bloodGroup
            });

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

            let patient = null;
            if (Types.ObjectId.isValid(id)) {
                patient = await this.patientService.getPatientById(new Types.ObjectId(id));
            }

            if (!patient && id.startsWith("MED-")) {
                patient = await this.patientService.getPatientByUhid(id);
            }

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

            if (data.branchId && !Types.ObjectId.isValid(data.branchId.toString())) {
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

    async addDocument(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const patientId = searchParams.get("patientId");

            if (!patientId || !Types.ObjectId.isValid(patientId)) {
                return NextResponse.json(
                    { success: false, message: "Valid patient ID is required" },
                    { status: 400 }
                );
            }

            const body: AddPatientDocumentDto = await request.json();
            if (!body.title || !body.fileUrl || !body.fileName) {
                return NextResponse.json(
                    { success: false, message: "Title, File Name, and File URL are required" },
                    { status: 400 }
                );
            }

            const updated = await this.patientService.addDocument(new Types.ObjectId(patientId), body);
            return NextResponse.json(
                { success: true, message: "Document added successfully", data: updated },
                { status: 201 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to add document" },
                { status: error?.statusCode || 500 }
            );
        }
    }

    async deleteDocument(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const patientId = searchParams.get("patientId");
            const documentId = searchParams.get("documentId");

            if (!patientId || !Types.ObjectId.isValid(patientId) || !documentId) {
                return NextResponse.json(
                    { success: false, message: "Valid patientId and documentId are required" },
                    { status: 400 }
                );
            }

            const updated = await this.patientService.deleteDocument(new Types.ObjectId(patientId), documentId);
            return NextResponse.json(
                { success: true, message: "Document deleted successfully", data: updated },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete document" },
                { status: error?.statusCode || 500 }
            );
        }
    }

    async mergePatients(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const body: MergePatientDto = await request.json();

            if (!body.primaryPatientId || !body.secondaryPatientId || !body.reason) {
                return NextResponse.json(
                    { success: false, message: "Primary Patient ID, Secondary Patient ID, and Reason are required" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(body.primaryPatientId) || !Types.ObjectId.isValid(body.secondaryPatientId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid Patient ID format" },
                    { status: 400 }
                );
            }

            const result = await this.patientService.mergePatients(
                new Types.ObjectId(body.primaryPatientId),
                new Types.ObjectId(body.secondaryPatientId),
                body.reason
            );

            return NextResponse.json(
                { success: true, message: "Patients merged successfully", data: result },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to merge patients" },
                { status: error?.statusCode || 500 }
            );
        }
    }

    async getPatientHistory(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const patientId = searchParams.get("patientId");

            if (!patientId || !Types.ObjectId.isValid(patientId)) {
                return NextResponse.json(
                    { success: false, message: "Valid patient ID is required" },
                    { status: 400 }
                );
            }

            const history = await this.patientService.getPatientHistory(new Types.ObjectId(patientId));

            return NextResponse.json(
                { success: true, data: history },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch patient history" },
                { status: error?.statusCode || 500 }
            );
        }
    }

    async getStats(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const branchId = searchParams.get("branchId") || undefined;

            const stats = await this.patientService.getStats(branchId);

            return NextResponse.json(
                { success: true, data: stats },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch patient statistics" },
                { status: 500 }
            );
        }
    }
}

export default new PatientController();

