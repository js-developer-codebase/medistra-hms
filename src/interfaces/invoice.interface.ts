import { Document, Types } from "mongoose";

export interface IInvoice extends Document {
    patientId: Types.ObjectId;
    invoiceNumber?: string;
    department?: string;
    items: {
        name: string;
        price: number;
        quantity: number;
        discount: number;
        tax?: number;
        total: number;
    }[];
    totalAmount: number;
    discount: number;
    taxAmount?: number;
    finalAmount: number;
    paidAmount?: number;
    balanceAmount?: number;
    paymentMethod?: string;
    dueDate?: Date;
    notes?: string;
    status: "PAID" | "UNPAID" | "PARTIALLY_PAID" | "CANCELLED" | string;
    branchId?: Types.ObjectId;
}