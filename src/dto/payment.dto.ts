import { Types } from "mongoose";

export interface CreatePaymentDto {
    invoiceId: Types.ObjectId | string;
    patientId: Types.ObjectId | string;
    amount: number;
    method: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "CHEQUE" | "INSURANCE_TPA" | string;
    transactionId?: string;
    receiptNumber?: string;
    cashierName?: string;
    notes?: string;
    branchId?: Types.ObjectId | string;
}

export interface UpdatePaymentDto {
    invoiceId?: Types.ObjectId | string;
    patientId?: Types.ObjectId | string;
    amount?: number;
    method?: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "CHEQUE" | "INSURANCE_TPA" | string;
    transactionId?: string;
    receiptNumber?: string;
    cashierName?: string;
    notes?: string;
    branchId?: Types.ObjectId | string;
}
