import mongoose, { Schema, Document } from "mongoose";

export interface ILabTest extends Document {
  name: string;
  code: string;
  category: string;
  description?: string;
  price: number;
  normalRange?: string;
  turnaroundTime?: string;
  isActive: boolean;
}

const labTestSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, default: 0 },
    normalRange: { type: String },
    turnaroundTime: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.LabTest || mongoose.model<ILabTest>("LabTest", labTestSchema);
