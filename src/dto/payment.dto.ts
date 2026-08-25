import { Types } from "mongoose";

export interface CreatePaymentDto {
    invoiceId: Types.ObjectId | string;
    patientId: Types.ObjectId | string;
    amount: number;
    method: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";
    transactionId?: string;
    branchId: Types.ObjectId | string;
}

export interface UpdatePaymentDto {
    invoiceId?: Types.ObjectId | string;
    patientId?: Types.ObjectId | string;
    amount?: number;
    method?: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";
    transactionId?: string;
    branchId?: Types.ObjectId | string;
}
