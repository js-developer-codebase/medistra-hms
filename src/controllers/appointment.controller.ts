import { NextRequest, NextResponse } from "next/server";
import { AppointmentService } from "@/services/appointment.service";
import dbConnect from "@/lib/dbConnect";

export const AppointmentController = {
    async create(req: NextRequest) {
        try {
            await dbConnect();
            const body = await req.json();
            
            // Just for demonstration, use a placeholder branchId if not provided
            if (!body.branchId) {
                body.branchId = "000000000000000000000000"; // Dummy objectId
            }
            
            const appointment = await AppointmentService.createAppointment(body);
            return NextResponse.json({ success: true, data: appointment }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
    },

    async getAll(req: NextRequest) {
        try {
            await dbConnect();
            const appointments = await AppointmentService.getAllAppointments();
            return NextResponse.json({ success: true, data: appointments });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
    },

    async getById(req: NextRequest, { params }: { params: { id: string } }) {
        try {
            await dbConnect();
            const appointment = await AppointmentService.getAppointmentById(params.id);
            if (!appointment) {
                return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: appointment });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
    },

    async update(req: NextRequest, { params }: { params: { id: string } }) {
        try {
            await dbConnect();
            const body = await req.json();
            const appointment = await AppointmentService.updateAppointment(params.id, body);
            if (!appointment) {
                return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: appointment });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
    },

    async delete(req: NextRequest, { params }: { params: { id: string } }) {
        try {
            await dbConnect();
            const appointment = await AppointmentService.deleteAppointment(params.id);
            if (!appointment) {
                return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: {} });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
    }
};
