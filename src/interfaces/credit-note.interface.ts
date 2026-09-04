import { Document, Types } from "mongoose";

export interface ICreditNote extends Document {
    creditNoteNumber: string;
    invoiceId: Types.ObjectId;
    patientId: Types.ObjectId;
    amount: number;
    reason: "SERVICE_CANCELLED" | "BILLING_ERROR" | "PRICING_DISPUTE" | "DISCOUNT_ADJUSTMENT" | "MEDICINE_RETURN" | "OTHER" | string;
    description: string;
    status: "ISSUED" | "APPLIED" | "SETTLED" | "CANCELLED" | string;
    issuedBy: string;
    issuedDate: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
