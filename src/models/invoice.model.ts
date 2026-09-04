import { Schema, model, models, Types } from "mongoose";
import { IInvoice } from "@/interfaces/invoice.interface";

const invoiceSchema = new Schema<IInvoice>({
    patientId: {
        type: Types.ObjectId,
        ref: "Patient",
        required: true
    },
    invoiceNumber: {
        type: String,
        index: true
    },
    department: {
        type: String,
        default: "General"
    },
    items: {
        type: [
            {
                name: String,
                price: Number,
                quantity: Number,
                discount: Number,
                tax: { type: Number, default: 0 },
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
    taxAmount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    balanceAmount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String
    },
    dueDate: {
        type: Date
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ["PAID", "UNPAID", "PARTIALLY_PAID", "CANCELLED"],
        default: "UNPAID"
    },
    branchId: {
        type: Types.ObjectId,
        ref: "Branch",
        required: false
    }
}, { timestamps: true });

export default models.Invoice || model<IInvoice>("Invoice", invoiceSchema);