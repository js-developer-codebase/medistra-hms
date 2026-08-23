import { Document, Types } from "mongoose";

export interface IInvoice extends Document {
    patientId: Types.ObjectId,
    items: {
        name: string,
        price: number,
        quantity: number,
        discount: number,
        total: number,
    }[],
    totalAmount: number,
    discount: number,
    finalAmount: number,
    status: string,
    branchId: Types.ObjectId
}