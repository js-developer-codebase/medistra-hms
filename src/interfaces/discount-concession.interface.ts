import { Document, Types } from "mongoose";

export interface IDiscountConcession extends Document {
    concessionNumber: string;
    patientId: Types.ObjectId;
    invoiceId?: Types.ObjectId;
    category: "STAFF_DEPENDENT" | "BPL_CARD_HOLDER" | "SENIOR_CITIZEN" | "MANAGEMENT_CONCESSION" | "DOCTOR_DISCOUNT" | "EMERGENCY_WAIVER" | "GOVERNMENT_SCHEME" | string;
    discountType: "PERCENTAGE" | "FLAT_AMOUNT" | string;
    discountValue: number;
    discountAmount: number;
    applicableDepartment: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "APPLIED" | string;
    approvedBy: string;
    reason: string;
    validUntil?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
