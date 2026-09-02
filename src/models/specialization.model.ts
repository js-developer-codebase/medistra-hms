import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISpecialization extends Document {
  name: string;
  code: string;
  departmentId?: Types.ObjectId;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const specializationSchema = new Schema<ISpecialization>(
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
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
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

const Specialization =
  mongoose.models.Specialization ||
  mongoose.model<ISpecialization>("Specialization", specializationSchema);

export default Specialization;
