import { Document, Types } from "mongoose";

export interface IPurchaseOrderItem {
  itemId?: Types.ObjectId;
  itemName?: string;
  itemCode?: string;
  uom?: string;
  quantity: number;
  receivedQuantity?: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  supplierId?: Types.ObjectId;
  supplierName?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  paymentTerms?: string;
  subTotal?: number;
  taxAmount?: number;
  totalAmount: number;
  prReference?: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";
  deliveryStatus?: "PENDING" | "PARTIALLY_DELIVERED" | "DELIVERED";
  approvedBy?: string;
  approvalDate?: Date;
  items: IPurchaseOrderItem[];
  notes?: string;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
