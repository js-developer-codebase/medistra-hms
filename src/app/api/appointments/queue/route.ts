import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/appointment.model";
import Patient from "@/models/patient.model";
import Doctor from "@/models/doctor.model";
import User from "@/models/user.model";
import Department from "@/models/department.model";
import { AppointmentService } from "@/services/appointment.service";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        if (!Patient) {}
        if (!Doctor) {}
        if (!User) {}
        if (!Department) {}

        await AppointmentService.ensureSampleAppointments();

        const { searchParams } = new URL(req.url);
        const doctorId = searchParams.get('doctorId');

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const query: any = {
            appointmentDate: { $gte: todayStart, $lt: todayEnd },
            status: { $nin: ["CANCELLED"] }
        };

        if (doctorId && doctorId !== 'ALL') {
            query.doctorId = doctorId;
        }

        const queue = await Appointment.find(query)
            .populate('patientId', 'name contact uhid age gender bloodGroup')
            .populate({
                path: 'doctorId',
                populate: [
                    { path: 'userId', select: 'name email phone' },
                    { path: 'departmentId', select: 'name code location' }
                ]
            })
            .sort({ tokenNumber: 1, createdAt: 1 })
            .lean();

        // Calculate queue metrics
        const waitingCount = queue.filter(q => q.queueStatus === 'WAITING' || q.status === 'CHECKED_IN').length;
        const inConsultationCount = queue.filter(q => q.queueStatus === 'IN_CONSULTATION' || q.status === 'IN_PROGRESS').length;
        const completedCount = queue.filter(q => q.queueStatus === 'COMPLETED' || q.status === 'COMPLETED').length;

        return NextResponse.json({
            success: true,
            data: queue,
            metrics: {
                totalToday: queue.length,
                waiting: waitingCount,
                inConsultation: inConsultationCount,
                completed: completedCount,
                estimatedWaitTimeMins: waitingCount * 15
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { appointmentId, action } = body;

        if (!appointmentId || !action) {
            return NextResponse.json({ success: false, error: "appointmentId and action are required" }, { status: 400 });
        }

        const updateData: any = {};
        const now = new Date();

        switch (action) {
            case "CHECK_IN":
                updateData.status = "CHECKED_IN";
                updateData.queueStatus = "WAITING";
                updateData.checkedInAt = now;
                break;
            case "START_CONSULTATION":
                updateData.status = "IN_PROGRESS";
                updateData.queueStatus = "IN_CONSULTATION";
                updateData.consultationStartedAt = now;
                break;
            case "COMPLETE":
                updateData.status = "COMPLETED";
                updateData.queueStatus = "COMPLETED";
                updateData.consultationEndedAt = now;
                break;
            case "SKIP":
            case "NO_SHOW":
                updateData.status = "NO_SHOW";
                updateData.queueStatus = "SKIPPED";
                updateData.noShowRecordedAt = now;
                break;
            default:
                return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
        }

        const updated = await Appointment.findByIdAndUpdate(appointmentId, updateData, { new: true })
            .populate('patientId', 'name contact uhid age gender bloodGroup')
            .populate({
                path: 'doctorId',
                populate: [
                    { path: 'userId', select: 'name email phone' },
                    { path: 'departmentId', select: 'name code location' }
                ]
            })
            .lean();

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
