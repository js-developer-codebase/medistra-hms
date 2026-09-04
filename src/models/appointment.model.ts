import mongoose, { model, models, Schema, Types } from "mongoose";
import { IAppointment } from "@/interfaces/appointment.interface";

const appointmentSchema = new Schema<IAppointment>(
    {
        patientId: {
            type: Schema.Types.ObjectId,
            ref: 'Patient',
            required: true
        },
        doctorId: {
            type: Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true
        },
        branchId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization'
        },
        appointmentDate: {
            type: Date,
            required: true
        },
        appointmentTime: {
            type: String,
            required: true
        },
        tokenNumber: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: [
                "SCHEDULED",
                "CONFIRMED",
                "CHECKED_IN",
                "IN_PROGRESS",
                "COMPLETED",
                "CANCELLED",
                "NO_SHOW",
            ],
            default: "SCHEDULED",
        },
        queueStatus: {
            type: String,
            enum: [
                "WAITING",
                "TRIAGE",
                "IN_CONSULTATION",
                "COMPLETED",
                "SKIPPED",
            ],
            default: "WAITING",
        },
        priority: {
            type: String,
            enum: ["NORMAL", "URGENT", "VIP"],
            default: "NORMAL",
        },
        type: {
            type: String,
            enum: [
                "NEW",
                "FOLLOW_UP",
                "EMERGENCY",
                "ROUTINE_CHECKUP"
            ],
            default: "NEW",
        },
        reason: {
            type: String,
            required: true
        },
        notes: {
            type: String
        },
        consultationFee: {
            type: Number,
            default: 0
        },
        paymentStatus: {
            type: String,
            enum: ["PAID", "PENDING", "WAIVED"],
            default: "PENDING"
        },
        paymentMode: {
            type: String,
            default: "CASH"
        },
        cancellationReason: {
            type: String
        },
        cancellationCategory: {
            type: String
        },
        cancelledAt: {
            type: Date
        },
        rescheduledFrom: {
            type: Schema.Types.Mixed
        },
        rescheduleReason: {
            type: String
        },
        checkedInAt: {
            type: Date
        },
        consultationStartedAt: {
            type: Date
        },
        consultationEndedAt: {
            type: Date
        },
        noShowRecordedAt: {
            type: Date
        }
    }, { timestamps: true });

const Appointment = models.Appointment || model<IAppointment>('Appointment', appointmentSchema);
export default Appointment;