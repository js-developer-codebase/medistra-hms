import { Document, Types } from "mongoose";

export interface IStockTransaction extends Document {
    itemId: Types.ObjectId;
    transactionType: "IN" | "OUT" | "ADJUSTMENT";
    quantity: number;
    reference: string;
    notes?: string;
    transactionDate: Date;
    performedBy?: Types.ObjectId;
}
