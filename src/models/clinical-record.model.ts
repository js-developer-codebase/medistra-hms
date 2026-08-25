import mongoose, { Schema, Document } from "mongoose";

export interface IClinicalRecord extends Document {
  patient: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  recordType: string; // e.g., "Consultation", "Progress Note", "Discharge Summary"
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  objectiveFindings?: string;
  assessment?: string;
  plan?: string;
  dateRecorded: Date;
  status: "Draft" | "Final";
}

const ClinicalRecordSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "User" },
    recordType: { type: String, required: true, default: "Consultation" },
    chiefComplaint: { type: String },
    historyOfPresentIllness: { type: String },
    objectiveFindings: { type: String },
    assessment: { type: String },
    plan: { type: String },
    dateRecorded: { type: Date, default: Date.now },
    status: { type: String, enum: ["Draft", "Final"], default: "Draft" },
  },
  { timestamps: true }
);

export const ClinicalRecord =
  mongoose.models.ClinicalRecord ||
  mongoose.model<IClinicalRecord>("ClinicalRecord", ClinicalRecordSchema);
