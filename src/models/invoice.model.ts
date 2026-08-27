import { Schema, model, models, Types } from "mongoose";
import { IInvoice } from "@/interfaces/invoice.interface";

const invoiceSchema = new Schema<IInvoice>({
    patientId: {
        type: Types.ObjectId,
        ref: "Patient",
        required: true
    },
    items: {
        type: [
            {
                name: String,
                price: Number,
                quantity: Number,
                discount: Number,
                total: Number,
            }
        ],
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    finalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["PAID", "UNPAID"],
        default: "UNPAID"
    },
    branchId: {
        type: Types.ObjectId,
        ref: "Branch",
        required: true
    }
}, { timestamps: true });

export default models.Invoice || model<IInvoice>("Invoice", invoiceSchema);