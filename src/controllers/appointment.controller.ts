import { NextRequest, NextResponse } from "next/server";
import { AppointmentService } from "@/services/appointment.service";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/patient.model";
import Organization from "@/models/organization.model";
import { Types } from "mongoose";

export const AppointmentController = {
    async create(req: NextRequest) {
        try {
            await dbConnect();
            const body = await req.json();

            // Support quick patient creation if patient details provided without patientId
            if (!body.patientId && body.patientName && body.contact) {
                let org = await Organization.findOne();
                const newPatient = await Patient.create({
                    name: body.patientName.trim(),
                    contact: body.contact.trim(),
                    age: Number(body.patientAge) || 30,
                    gender: body.patientGender || "OTHER",
                    bloodGroup: body.patientBloodGroup || "O+",
                    address: body.patientAddress || "Walk-in Registration",
                    emergencyContact: body.contact.trim(),
                    branchId: org?._id || new Types.ObjectId("000000000000000000000000")
                });
                body.patientId = newPatient._id;
            }

            if (!body.patientId || !body.doctorId || !body.appointmentDate || !body.appointmentTime) {
                return NextResponse.json(
                    { success: false, error: "Patient, Doctor, Date, and Time are required" },
                    { status: 400 }
                );
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
            const { searchParams } = new URL(req.url);
            const status = searchParams.get('status');
            const type = searchParams.get('type');
            const doctorId = searchParams.get('doctorId');
            const date = searchParams.get('date');
            const search = searchParams.get('search')?.toLowerCase().trim();

            let appointments = await AppointmentService.getAllAppointments({
                status,
                type,
                doctorId,
                date
            });

            if (search) {
                appointments = appointments.filter((apt: any) => {
                    const pName = apt.patientId?.name?.toLowerCase() || "";
                    const pContact = apt.patientId?.contact?.toLowerCase() || "";
                    const pUhid = apt.patientId?.uhid?.toLowerCase() || "";
                    const dName = (apt.doctorId?.userId?.name || apt.doctorId?.name || "").toLowerCase();
                    const token = apt.tokenNumber?.toLowerCase() || "";
                    const reason = apt.reason?.toLowerCase() || "";
                    return (
                        pName.includes(search) ||
                        pContact.includes(search) ||
                        pUhid.includes(search) ||
                        dName.includes(search) ||
                        token.includes(search) ||
                        reason.includes(search)
                    );
                });
            }

            return NextResponse.json({ success: true, count: appointments.length, data: appointments });
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
