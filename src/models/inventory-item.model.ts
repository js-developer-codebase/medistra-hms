import { Schema, model, models } from "mongoose";
import { IInventoryItem } from "@/interfaces/inventory-item.interface";

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    specification: { type: String },
    unit: { type: String, required: true, default: "Piece" },
    reorderLevel: { type: Number, default: 20 },
    safetyStock: { type: Number, default: 10 },
    currentStock: { type: Number, default: 0 },
    unitPrice: { type: Number, required: true, default: 0 },
    storageLocation: { type: String, default: "Central Warehouse - Rack A1" },
    supplierName: { type: String },
    leadTimeDays: { type: Number, default: 3 },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" }
  },
  { timestamps: true }
);

export const InventoryItem =
  models.InventoryItem || model<IInventoryItem>("InventoryItem", inventoryItemSchema);

export default InventoryItem;
