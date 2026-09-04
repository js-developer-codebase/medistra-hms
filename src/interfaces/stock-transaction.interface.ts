import { Document, Types } from "mongoose";

export interface IStockTransaction extends Document {
  transactionCode: string;
  itemId: Types.ObjectId;
  itemName?: string;
  transactionType: "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";
  quantity: number;
  batchNumber?: string;
  expiryDate?: Date;
  unitPrice: number; // in INR ₹
  totalAmount: number; // in INR ₹
  sourceDepartment?: string;
  destinationDepartment?: string;
  reference: string;
  notes?: string;
  transactionDate: Date;
  performedBy?: Types.ObjectId;
  performedByName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
