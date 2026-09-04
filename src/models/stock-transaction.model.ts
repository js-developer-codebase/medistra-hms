import { Schema, model, models } from "mongoose";
import { IStockTransaction } from "@/interfaces/stock-transaction.interface";

const stockTransactionSchema = new Schema<IStockTransaction>(
  {
    transactionCode: { type: String, required: true },
    itemId: { type: Schema.Types.ObjectId, ref: "InventoryItem", required: true },
    itemName: { type: String },
    transactionType: {
      type: String,
      enum: ["IN", "OUT", "TRANSFER", "ADJUSTMENT"],
      required: true
    },
    quantity: { type: Number, required: true },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    unitPrice: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    sourceDepartment: { type: String, default: "Central Warehouse" },
    destinationDepartment: { type: String },
    reference: { type: String, required: true },
    notes: { type: String },
    transactionDate: { type: Date, default: Date.now },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    performedByName: { type: String, default: "Storekeeper" }
  },
  { timestamps: true }
);

export const StockTransaction =
  models.StockTransaction ||
  model<IStockTransaction>("StockTransaction", stockTransactionSchema);

export default StockTransaction;
