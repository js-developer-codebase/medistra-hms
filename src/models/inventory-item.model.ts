import { Schema, model, models } from "mongoose";
import { IInventoryItem } from "@/interfaces/inventory-item.interface";

const inventoryItemSchema = new Schema<IInventoryItem>({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    reorderLevel: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    unitPrice: { type: Number, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" }
}, { timestamps: true });

export default models.InventoryItem || model<IInventoryItem>("InventoryItem", inventoryItemSchema);
