import { Schema, model, models, Types } from "mongoose";
import { IPatientRefund } from "@/interfaces/patient-refund.interface";

const patientRefundSchema = new Schema<IPatientRefund>(
    {
        refundNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        patientId: {
            type: Types.ObjectId,
            ref: "Patient",
            required: true,
            index: true
        },
        invoiceId: {
            type: Types.ObjectId,
            ref: "Invoice"
        },
        paymentId: {
            type: Types.ObjectId,
            ref: "Payment"
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        reason: {
            type: String,
            required: true
        },
        department: {
            type: String,
            default: "Billing"
        },
        refundMethod: {
            type: String,
            enum: ["CASH", "ORIGINAL_PAYMENT_MODE", "BANK_TRANSFER", "UPI"],
            default: "CASH"
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "PROCESSED"],
            default: "PENDING",
            index: true
        },
        requestedBy: {
            type: String,
            default: "Staff Cashier"
        },
        approvedBy: {
            type: String
        },
        processedAt: {
            type: Date
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

export default models.PatientRefund || model<IPatientRefund>("PatientRefund", patientRefundSchema);
