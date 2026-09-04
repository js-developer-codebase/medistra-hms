import { Document, Types } from "mongoose";

export interface IPatientRefund extends Document {
    refundNumber: string;
    patientId: Types.ObjectId;
    invoiceId?: Types.ObjectId;
    paymentId?: Types.ObjectId;
    amount: number;
    reason: string;
    department: string;
    refundMethod: "CASH" | "ORIGINAL_PAYMENT_MODE" | "BANK_TRANSFER" | "UPI" | string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED" | string;
    requestedBy: string;
    approvedBy?: string;
    processedAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
