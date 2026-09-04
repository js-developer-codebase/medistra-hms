import { Document, Types } from 'mongoose';

export interface IPayment extends Document {
    invoiceId: Types.ObjectId;
    patientId: Types.ObjectId;
    amount: number;
    method: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "CHEQUE" | "INSURANCE_TPA" | string;
    transactionId?: string;
    receiptNumber?: string;
    cashierName?: string;
    notes?: string;
    date: Date;
    branchId?: Types.ObjectId;
}
