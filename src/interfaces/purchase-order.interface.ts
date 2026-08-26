import { Document, Types } from "mongoose";

export interface IPurchaseOrderItem {
    itemId: Types.ObjectId;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface IPurchaseOrder extends Document {
    poNumber: string;
    supplierId: Types.ObjectId;
    orderDate: Date;
    expectedDeliveryDate?: Date;
    status: "DRAFT" | "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";
    items: IPurchaseOrderItem[];
    totalAmount: number;
    notes?: string;
    createdBy?: Types.ObjectId;
}
