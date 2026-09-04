import { Schema, model, models, Types } from "mongoose";
import { ICreditNote } from "@/interfaces/credit-note.interface";

const creditNoteSchema = new Schema<ICreditNote>(
    {
        creditNoteNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        invoiceId: {
            type: Types.ObjectId,
            ref: "Invoice",
            required: true,
            index: true
        },
        patientId: {
            type: Types.ObjectId,
            ref: "Patient",
            required: true,
            index: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        reason: {
            type: String,
            enum: [
                "SERVICE_CANCELLED",
                "BILLING_ERROR",
                "PRICING_DISPUTE",
                "DISCOUNT_ADJUSTMENT",
                "MEDICINE_RETURN",
                "OTHER"
            ],
            default: "BILLING_ERROR"
        },
        description: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["ISSUED", "APPLIED", "SETTLED", "CANCELLED"],
            default: "ISSUED",
            index: true
        },
        issuedBy: {
            type: String,
            default: "Finance Officer"
        },
        issuedDate: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

export default models.CreditNote || model<ICreditNote>("CreditNote", creditNoteSchema);
