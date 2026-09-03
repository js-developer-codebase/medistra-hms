import mongoose, { Schema, Document } from "mongoose";

export interface ISurgeryRequest extends Document {
  requestCode: string;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  requestingDoctor: string;
  department: string;
  procedureProposed: string;
  diagnosis: string;
  urgency: "ELECTIVE" | "URGENT" | "EMERGENCY_STAT";
  preferredDate: Date;
  estimatedDuration: number; // in minutes
  pacCleared: boolean;
  bloodArrangementRequired: boolean;
  bloodUnits?: number;
  status: "PENDING" | "APPROVED" | "SCHEDULED" | "REJECTED";
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const surgeryRequestSchema = new Schema<ISurgeryRequest>(
  {
    requestCode: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    requestingDoctor: { type: String, required: true },
    department: { type: String, required: true, default: "General Surgery" },
    procedureProposed: { type: String, required: true },
    diagnosis: { type: String, required: true },
    urgency: {
      type: String,
      enum: ["ELECTIVE", "URGENT", "EMERGENCY_STAT"],
      default: "ELECTIVE"
    },
    preferredDate: { type: Date, required: true },
    estimatedDuration: { type: Number, default: 90 },
    pacCleared: { type: Boolean, default: false },
    bloodArrangementRequired: { type: Boolean, default: false },
    bloodUnits: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "SCHEDULED", "REJECTED"],
      default: "PENDING"
    },
    remarks: { type: String }
  },
  { timestamps: true }
);

export const SurgeryRequest =
  mongoose.models.SurgeryRequest ||
  mongoose.model<ISurgeryRequest>("SurgeryRequest", surgeryRequestSchema);

export default SurgeryRequest;
