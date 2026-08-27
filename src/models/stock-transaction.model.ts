import { Schema, model, models } from "mongoose";
import { IStockTransaction } from "@/interfaces/stock-transaction.interface";

const stockTransactionSchema = new Schema<IStockTransaction>({
    itemId: { type: Schema.Types.ObjectId, ref: "InventoryItem", required: true },
    transactionType: { type: String, enum: ["IN", "OUT", "ADJUSTMENT"], required: true },
    quantity: { type: Number, required: true },
    reference: { type: String, required: true },
    notes: { type: String },
    transactionDate: { type: Date, default: Date.now },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default models.StockTransaction || model<IStockTransaction>("StockTransaction", stockTransactionSchema);
