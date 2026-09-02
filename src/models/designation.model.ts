import mongoose, { Schema, Document } from "mongoose";

export interface IDesignation extends Document {
  name: string;
  code: string;
  department?: string;
  level?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const designationSchema = new Schema<IDesignation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      trim: true,
      default: "General",
    },
    level: {
      type: String,
      trim: true,
      default: "Mid-Level",
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Designation =
  mongoose.models.Designation ||
  mongoose.model<IDesignation>("Designation", designationSchema);

export default Designation;
