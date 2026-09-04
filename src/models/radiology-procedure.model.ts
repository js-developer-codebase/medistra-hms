import mongoose, { Schema, Document } from "mongoose";

export interface IRadiologyProcedure extends Document {
  name: string;
  code: string;
  modality: "X-RAY" | "CT" | "MRI" | "ULTRASOUND" | "MAMMOGRAPHY" | "DEXA" | "FLUOROSCOPY" | "PET-CT";
  bodyPart: string;
  price: number;
  preparationInstructions?: string;
  durationMinutes?: number;
  requiresContrast?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RadiologyProcedureSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    modality: {
      type: String,
      enum: ["X-RAY", "CT", "MRI", "ULTRASOUND", "MAMMOGRAPHY", "DEXA", "FLUOROSCOPY", "PET-CT"],
      required: true
    },
    bodyPart: { type: String, required: true },
    price: { type: Number, required: true, default: 500 },
    preparationInstructions: { type: String },
    durationMinutes: { type: Number, default: 15 },
    requiresContrast: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.RadiologyProcedure ||
  mongoose.model<IRadiologyProcedure>("RadiologyProcedure", RadiologyProcedureSchema);
