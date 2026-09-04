import { Types } from "mongoose";

export interface InvoiceItemDto {
    name: string;
    price: number;
    quantity: number;
    discount: number;
    tax?: number;
    category?: string;
    total: number;
}

export interface CreateInvoiceDto {
    patientId: Types.ObjectId | string;
    invoiceNumber?: string;
    department?: string;
    items: InvoiceItemDto[];
    totalAmount: number;
    discount: number;
    taxAmount?: number;
    finalAmount: number;
    paidAmount?: number;
    balanceAmount?: number;
    paymentMethod?: string;
    dueDate?: Date;
    notes?: string;
    status?: string;
    branchId?: Types.ObjectId | string;
}

export interface UpdateInvoiceDto {
    patientId?: Types.ObjectId | string;
    invoiceNumber?: string;
    department?: string;
    items?: InvoiceItemDto[];
    totalAmount?: number;
    discount?: number;
    taxAmount?: number;
    finalAmount?: number;
    paidAmount?: number;
    balanceAmount?: number;
    paymentMethod?: string;
    dueDate?: Date;
    notes?: string;
    status?: string;
    branchId?: Types.ObjectId | string;
}
