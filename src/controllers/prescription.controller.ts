import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import prescriptionService, { PrescriptionService } from "@/services/prescription.service";
import { CreatePrescriptionDto, UpdatePrescriptionDto } from "@/dto/prescription.dto";

export class PrescriptionController {
    constructor(private prescriptionService: PrescriptionService = prescriptionService) { }

    async createPrescription(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreatePrescriptionDto = await request.json();

            if (!data.patientId || !data.doctorId || !data.branchId || !data.appointmentId || !data.visitDate || !data.medications) {
                return NextResponse.json(
                    { success: false, message: "Required fields are missing" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.patientId) || !Types.ObjectId.isValid(data.doctorId) || !Types.ObjectId.isValid(data.branchId) || !Types.ObjectId.isValid(data.appointmentId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid ID format for patient, doctor, branch, or appointment" },
                    { status: 400 }
                );
            }

            const prescription = await this.prescriptionService.createPrescription(data);

            return NextResponse.json(
                { success: true, message: "Prescription created successfully", data: prescription },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create prescription" },
                { status: statusCode }
            );
        }
    }

    async getPrescriptions(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();

            const { searchParams } = new URL(request.url);
            const branchId = searchParams.get('branchId');
            const patientId = searchParams.get('patientId');
            const doctorId = searchParams.get('doctorId');
            const appointmentId = searchParams.get('appointmentId');

            let prescriptions;

            if (branchId) {
                if (!Types.ObjectId.isValid(branchId)) return NextResponse.json({ success: false, message: "Invalid branch ID" }, { status: 400 });
                prescriptions = await this.prescriptionService.getPrescriptionsByBranchId(new Types.ObjectId(branchId));
            } else if (patientId) {
                if (!Types.ObjectId.isValid(patientId)) return NextResponse.json({ success: false, message: "Invalid patient ID" }, { status: 400 });
                prescriptions = await this.prescriptionService.getPrescriptionsByPatientId(new Types.ObjectId(patientId));
            } else if (doctorId) {
                if (!Types.ObjectId.isValid(doctorId)) return NextResponse.json({ success: false, message: "Invalid doctor ID" }, { status: 400 });
                prescriptions = await this.prescriptionService.getPrescriptionsByDoctorId(new Types.ObjectId(doctorId));
            } else if (appointmentId) {
                if (!Types.ObjectId.isValid(appointmentId)) return NextResponse.json({ success: false, message: "Invalid appointment ID" }, { status: 400 });
                prescriptions = await this.prescriptionService.getPrescriptionsByAppointmentId(new Types.ObjectId(appointmentId));
            } else {
                prescriptions = await this.prescriptionService.getAllPrescriptions();
            }

            return NextResponse.json(
                { success: true, count: prescriptions.length, data: prescriptions },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch prescriptions" },
                { status: 500 }
            );
        }
    }

    async getPrescriptionById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid prescription ID" },
                    { status: 400 }
                );
            }

            const prescription = await this.prescriptionService.getPrescriptionById(new Types.ObjectId(id));
            if (!prescription) {
                return NextResponse.json(
                    { success: false, message: "Prescription not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: prescription },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch prescription" },
                { status: 500 }
            );
        }
    }

    async updatePrescription(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid prescription ID" },
                    { status: 400 }
                );
            }

            const data: UpdatePrescriptionDto = await request.json();

            if ((data.patientId && !Types.ObjectId.isValid(data.patientId)) ||
                (data.doctorId && !Types.ObjectId.isValid(data.doctorId)) ||
                (data.branchId && !Types.ObjectId.isValid(data.branchId)) ||
                (data.appointmentId && !Types.ObjectId.isValid(data.appointmentId))) {
                return NextResponse.json(
                    { success: false, message: "Invalid ID format for patient, doctor, branch, or appointment" },
                    { status: 400 }
                );
            }

            const prescription = await this.prescriptionService.updatePrescription(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "Prescription updated successfully", data: prescription },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update prescription" },
                { status: statusCode }
            );
        }
    }

    async deletePrescription(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid prescription ID" },
                    { status: 400 }
                );
            }

            await this.prescriptionService.deletePrescription(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Prescription deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete prescription" },
                { status: statusCode }
            );
        }
    }
}

export default new PrescriptionController();
