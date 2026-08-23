import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import appointmentService, { AppointmentService } from "@/services/appointment.service";
import { CreateAppointmentDto, UpdateAppointmentDto } from "@/dto/appointment.dto";

export class AppointmentController {
    constructor(private appointmentService: AppointmentService = appointmentService) { }

    async createAppointment(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateAppointmentDto = await request.json();

            if (!data.patientId || !data.doctorId || !data.branchId || !data.appointmentDate || !data.appointmentTime || !data.reason) {
                return NextResponse.json(
                    { success: false, message: "Required fields are missing" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.patientId) || !Types.ObjectId.isValid(data.doctorId) || !Types.ObjectId.isValid(data.branchId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid ID format for patient, doctor, or branch" },
                    { status: 400 }
                );
            }

            const appointment = await this.appointmentService.createAppointment(data);

            return NextResponse.json(
                { success: true, message: "Appointment created successfully", data: appointment },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create appointment" },
                { status: statusCode }
            );
        }
    }

    async getAppointments(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();

            const { searchParams } = new URL(request.url);
            const branchId = searchParams.get('branchId');
            const patientId = searchParams.get('patientId');
            const doctorId = searchParams.get('doctorId');

            let appointments;

            if (branchId) {
                if (!Types.ObjectId.isValid(branchId)) return NextResponse.json({ success: false, message: "Invalid branch ID" }, { status: 400 });
                appointments = await this.appointmentService.getAppointmentsByBranchId(new Types.ObjectId(branchId));
            } else if (patientId) {
                if (!Types.ObjectId.isValid(patientId)) return NextResponse.json({ success: false, message: "Invalid patient ID" }, { status: 400 });
                appointments = await this.appointmentService.getAppointmentsByPatientId(new Types.ObjectId(patientId));
            } else if (doctorId) {
                if (!Types.ObjectId.isValid(doctorId)) return NextResponse.json({ success: false, message: "Invalid doctor ID" }, { status: 400 });
                appointments = await this.appointmentService.getAppointmentsByDoctorId(new Types.ObjectId(doctorId));
            } else {
                appointments = await this.appointmentService.getAllAppointments();
            }

            return NextResponse.json(
                { success: true, count: appointments.length, data: appointments },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch appointments" },
                { status: 500 }
            );
        }
    }

    async getAppointmentById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid appointment ID" },
                    { status: 400 }
                );
            }

            const appointment = await this.appointmentService.getAppointmentById(new Types.ObjectId(id));
            if (!appointment) {
                return NextResponse.json(
                    { success: false, message: "Appointment not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: appointment },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch appointment" },
                { status: 500 }
            );
        }
    }

    async updateAppointment(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid appointment ID" },
                    { status: 400 }
                );
            }

            const data: UpdateAppointmentDto = await request.json();

            if ((data.patientId && !Types.ObjectId.isValid(data.patientId)) ||
                (data.doctorId && !Types.ObjectId.isValid(data.doctorId)) ||
                (data.branchId && !Types.ObjectId.isValid(data.branchId))) {
                return NextResponse.json(
                    { success: false, message: "Invalid ID format for patient, doctor, or branch" },
                    { status: 400 }
                );
            }

            const appointment = await this.appointmentService.updateAppointment(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "Appointment updated successfully", data: appointment },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update appointment" },
                { status: statusCode }
            );
        }
    }

    async deleteAppointment(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid appointment ID" },
                    { status: 400 }
                );
            }

            await this.appointmentService.deleteAppointment(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Appointment deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete appointment" },
                { status: statusCode }
            );
        }
    }
}

export default new AppointmentController();
