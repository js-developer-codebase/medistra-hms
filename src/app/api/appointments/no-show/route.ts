import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/appointment.model";
import Patient from "@/models/patient.model";
import Doctor from "@/models/doctor.model";
import User from "@/models/user.model";
import Department from "@/models/department.model";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        if (!Patient) {}
        if (!Doctor) {}
        if (!User) {}
        if (!Department) {}

        const now = new Date();

        // Fetch explicitly marked NO_SHOW appointments
        const noShowList = await Appointment.find({ status: "NO_SHOW" })
            .populate('patientId', 'name contact uhid age gender bloodGroup address')
            .populate({
                path: 'doctorId',
                populate: [
                    { path: 'userId', select: 'name email phone' },
                    { path: 'departmentId', select: 'name code location' }
                ]
            })
            .sort({ appointmentDate: -1 })
            .lean();

        // Also identify overdue appointments that were scheduled in the past but never checked in
        const overdueUnchecked = await Appointment.find({
            status: "SCHEDULED",
            appointmentDate: { $lt: now }
        })
            .populate('patientId', 'name contact uhid age gender bloodGroup address')
            .populate({
                path: 'doctorId',
                populate: [
                    { path: 'userId', select: 'name email phone' },
                    { path: 'departmentId', select: 'name code location' }
                ]
            })
            .sort({ appointmentDate: -1 })
            .lean();

        const totalAppointments = await Appointment.countDocuments();
        const noShowRate = totalAppointments > 0
            ? Math.round((noShowList.length / totalAppointments) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                noShows: noShowList,
                overduePending: overdueUnchecked
            },
            metrics: {
                totalNoShows: noShowList.length,
                pendingOverdueCount: overdueUnchecked.length,
                noShowRatePercentage: noShowRate
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
        const { appointmentId, action, notes } = body;

        if (!appointmentId) {
            return NextResponse.json({ success: false, error: "appointmentId is required" }, { status: 400 });
        }

        const appt = await Appointment.findById(appointmentId);
        if (!appt) {
            return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
        }

        if (action === "MARK_NO_SHOW") {
            appt.status = "NO_SHOW";
            appt.queueStatus = "SKIPPED";
            appt.noShowRecordedAt = new Date();
            if (notes) {
                appt.notes = appt.notes ? `${appt.notes} | No-Show Note: ${notes}` : `No-Show Note: ${notes}`;
            }
            await appt.save();
        } else if (action === "RECORD_FOLLOWUP") {
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            appt.notes = appt.notes
                ? `${appt.notes} | [${timestamp} Follow-up]: ${notes || 'Patient contacted'}`
                : `[${timestamp} Follow-up]: ${notes || 'Patient contacted'}`;
            await appt.save();
        }

        const updated = await Appointment.findById(appointmentId)
            .populate('patientId', 'name contact uhid age gender')
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
