import { Document, Types } from 'mongoose';

export interface IPayment extends Document {
    invoiceId: Types.ObjectId;
    patientId: Types.ObjectId;
    amount: number;
    method: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";
    transactionId?: string;
    date: Date;
    branchId: Types.ObjectId;
}
