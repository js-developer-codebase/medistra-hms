import mongoose, { Schema, Document } from "mongoose";

export interface IStockAdjustment extends Document {
  adjustmentCode: string;
  itemId?: mongoose.Types.ObjectId;
  itemName: string;
  batchNumber?: string;
  previousStock: number;
  physicalCount: number;
  difference: number;
  adjustmentType:
    | "DAMAGED_WRITE_OFF"
    | "BREAKAGE"
    | "EXPIRY_REMOVAL"
    | "AUDIT_SURPLUS"
    | "AUDIT_DEFICIT";
  unitPrice: number;
  costImpact: number; // in INR ₹
  reason: string;
  adjustedBy: string;
  approvedBy?: string;
  adjustmentDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const stockAdjustmentSchema = new Schema<IStockAdjustment>(
  {
    adjustmentCode: { type: String, required: true, unique: true },
    itemId: { type: Schema.Types.ObjectId, ref: "InventoryItem" },
    itemName: { type: String, required: true },
    batchNumber: { type: String },
    previousStock: { type: Number, required: true },
    physicalCount: { type: Number, required: true },
    difference: { type: Number, required: true },
    adjustmentType: {
      type: String,
      enum: [
        "DAMAGED_WRITE_OFF",
        "BREAKAGE",
        "EXPIRY_REMOVAL",
        "AUDIT_SURPLUS",
        "AUDIT_DEFICIT"
      ],
      required: true
    },
    unitPrice: { type: Number, default: 0 },
    costImpact: { type: Number, default: 0 },
    reason: { type: String, required: true },
    adjustedBy: { type: String, required: true },
    approvedBy: { type: String, default: "Inventory Manager" },
    adjustmentDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const StockAdjustment =
  mongoose.models.StockAdjustment ||
  mongoose.model<IStockAdjustment>("StockAdjustment", stockAdjustmentSchema);

export default StockAdjustment;
