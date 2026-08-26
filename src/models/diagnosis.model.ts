import mongoose, { Schema, Document } from "mongoose";

export interface IDiagnosis extends Document {
  patient: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  code?: string; // ICD10 or similar
  description: string;
  status: "Active" | "Resolved" | "Chronic";
  dateDiagnosed: Date;
  notes?: string;
}

const DiagnosisSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "User" },
    code: { type: String },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Resolved", "Chronic"],
      default: "Active",
    },
    dateDiagnosed: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Diagnosis =
  mongoose.models.Diagnosis || mongoose.model<IDiagnosis>("Diagnosis", DiagnosisSchema);
