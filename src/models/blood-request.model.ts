import mongoose, { Schema, Document } from "mongoose";

export interface IBloodRequest extends Document {
  requestCode: string;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  wardOrDepartment: string;
  doctorName: string;
  diagnosis: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  componentRequested: "PRBC" | "WHOLE_BLOOD" | "FFP" | "PLATELETS" | "CRYOPRECIPITATE";
  unitsRequested: number;
  urgency: "ROUTINE" | "URGENT" | "EMERGENCY_STAT_UNMATCHED";
  requiredByDate: Date;
  status: "PENDING" | "CROSSMATCHING" | "READY_FOR_ISSUE" | "ISSUED" | "CANCELLED";
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bloodRequestSchema = new Schema<IBloodRequest>(
  {
    requestCode: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    wardOrDepartment: { type: String, required: true, default: "Emergency" },
    doctorName: { type: String, required: true },
    diagnosis: { type: String, required: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    componentRequested: {
      type: String,
      required: true,
      enum: ["PRBC", "WHOLE_BLOOD", "FFP", "PLATELETS", "CRYOPRECIPITATE"],
      default: "PRBC"
    },
    unitsRequested: { type: Number, required: true, default: 1 },
    urgency: {
      type: String,
      enum: ["ROUTINE", "URGENT", "EMERGENCY_STAT_UNMATCHED"],
      default: "ROUTINE"
    },
    requiredByDate: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["PENDING", "CROSSMATCHING", "READY_FOR_ISSUE", "ISSUED", "CANCELLED"],
      default: "PENDING"
    },
    remarks: { type: String }
  },
  { timestamps: true }
);

export const BloodRequest =
  mongoose.models.BloodRequest ||
  mongoose.model<IBloodRequest>("BloodRequest", bloodRequestSchema);

export default BloodRequest;
