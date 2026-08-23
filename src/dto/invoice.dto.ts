import { Types } from "mongoose";

export interface InvoiceItemDto {
    name: string;
    price: number;
    quantity: number;
    discount: number;
    total: number;
}

export interface CreateInvoiceDto {
    patientId: Types.ObjectId | string;
    items: InvoiceItemDto[];
    totalAmount: number;
    discount: number;
    finalAmount: number;
    status?: string; // Optional due to default in schema
    branchId: Types.ObjectId | string;
}

export interface UpdateInvoiceDto {
    patientId?: Types.ObjectId | string;
    items?: InvoiceItemDto[];
    totalAmount?: number;
    discount?: number;
    finalAmount?: number;
    status?: string;
    branchId?: Types.ObjectId | string;
}
