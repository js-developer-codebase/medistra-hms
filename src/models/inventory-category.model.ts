import mongoose, { Schema, Document } from "mongoose";

export interface IInventoryCategory extends Document {
  code: string;
  name: string;
  description?: string;
  itemCount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const inventoryCategorySchema = new Schema<IInventoryCategory>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    description: { type: String },
    itemCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const InventoryCategory =
  mongoose.models.InventoryCategory ||
  mongoose.model<IInventoryCategory>("InventoryCategory", inventoryCategorySchema);

export default InventoryCategory;
