import { Document, Types } from "mongoose";

export interface IInventoryItem extends Document {
    code: string;
    name: string;
    category: string;
    unit: string;
    reorderLevel: number;
    currentStock: number;
    unitPrice: number;
    description?: string;
    isActive: boolean;
    branchId?: Types.ObjectId;
}
