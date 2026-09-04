import { Document, Types } from "mongoose";

export interface IInventoryItem extends Document {
  code: string;
  name: string;
  category: string;
  subCategory?: string;
  specification?: string;
  unit: string;
  reorderLevel: number;
  safetyStock: number;
  currentStock: number;
  unitPrice: number; // in INR ₹
  storageLocation?: string;
  supplierName?: string;
  leadTimeDays?: number;
  description?: string;
  isActive: boolean;
  branchId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
