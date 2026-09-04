import { Document, Types } from "mongoose";

export interface IAppointment extends Document {
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    branchId?: Types.ObjectId;
    appointmentDate: Date;
    appointmentTime: string;
    status: string;
    type: string;
    reason: string;
    notes?: string;
    tokenNumber?: string;
    queueStatus?: "WAITING" | "TRIAGE" | "IN_CONSULTATION" | "COMPLETED" | "SKIPPED";
    priority?: "NORMAL" | "URGENT" | "VIP";
    consultationFee?: number;
    paymentStatus?: "PAID" | "PENDING" | "WAIVED";
    paymentMode?: string;
    cancellationReason?: string;
    cancellationCategory?: string;
    cancelledAt?: Date;
    rescheduledFrom?: Date | Types.ObjectId;
    rescheduleReason?: string;
    checkedInAt?: Date;
    consultationStartedAt?: Date;
    consultationEndedAt?: Date;
    noShowRecordedAt?: Date;
}