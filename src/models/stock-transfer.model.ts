import mongoose, { Schema, Document } from "mongoose";

export interface IStockTransfer extends Document {
  transferCode: string;
  sourceLocation: string;
  destinationLocation: string;
  itemId?: mongoose.Types.ObjectId;
  itemName: string;
  quantity: number;
  batchNumber?: string;
  requestedBy: string;
  approvedBy?: string;
  receivedBy?: string;
  status: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "REJECTED";
  transferDate: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const stockTransferSchema = new Schema<IStockTransfer>(
  {
    transferCode: { type: String, required: true, unique: true },
    sourceLocation: { type: String, required: true, default: "Central Warehouse" },
    destinationLocation: { type: String, required: true },
    itemId: { type: Schema.Types.ObjectId, ref: "InventoryItem" },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    batchNumber: { type: String },
    requestedBy: { type: String, required: true },
    approvedBy: { type: String },
    receivedBy: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "IN_TRANSIT", "COMPLETED", "REJECTED"],
      default: "PENDING"
    },
    transferDate: { type: Date, default: Date.now },
    notes: { type: String }
  },
  { timestamps: true }
);

export const StockTransfer =
  mongoose.models.StockTransfer ||
  mongoose.model<IStockTransfer>("StockTransfer", stockTransferSchema);

export default StockTransfer;
