import { Schema, model, models, Types } from "mongoose";
import { IDiscountConcession } from "@/interfaces/discount-concession.interface";

const discountConcessionSchema = new Schema<IDiscountConcession>(
    {
        concessionNumber: {
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
        category: {
            type: String,
            enum: [
                "STAFF_DEPENDENT",
                "BPL_CARD_HOLDER",
                "SENIOR_CITIZEN",
                "MANAGEMENT_CONCESSION",
                "DOCTOR_DISCOUNT",
                "EMERGENCY_WAIVER",
                "GOVERNMENT_SCHEME"
            ],
            default: "SENIOR_CITIZEN"
        },
        discountType: {
            type: String,
            enum: ["PERCENTAGE", "FLAT_AMOUNT"],
            default: "PERCENTAGE"
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0
        },
        discountAmount: {
            type: Number,
            required: true,
            min: 0
        },
        applicableDepartment: {
            type: String,
            default: "All Services"
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "APPLIED"],
            default: "PENDING",
            index: true
        },
        approvedBy: {
            type: String,
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        validUntil: {
            type: Date
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

export default models.DiscountConcession || model<IDiscountConcession>("DiscountConcession", discountConcessionSchema);
