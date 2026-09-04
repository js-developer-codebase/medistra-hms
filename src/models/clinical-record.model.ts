import mongoose, { Schema, Document } from "mongoose";

export interface IClinicalRecord extends Document {
  patient: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  recordType: string; // e.g., "Consultation", "Progress Note", "Clinical Note", "Treatment Plan", "Medical History", "Allergy", "Clinical Order", "Referral", "Follow-Up", "Patient Problem"
  title?: string;
  category?: string;
  details?: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  objectiveFindings?: string;
  assessment?: string;
  plan?: string;
  severity?: string; // "Mild" | "Moderate" | "Severe" | "Critical"
  reaction?: string;
  orderType?: string; // "Lab" | "Radiology" | "Procedure" | "Medication" | "Nursing" | "Diet"
  referralTo?: string;
  followUpDate?: Date;
  priority?: string; // "Routine" | "Urgent" | "STAT"
  instructions?: string;
  problemStatus?: string; // "Active" | "Chronic" | "Inactive" | "Resolved"
  resolutionDate?: Date;
  dateRecorded: Date;
  status: "Draft" | "Final";
}

const ClinicalRecordSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "User" },
    recordType: { type: String, required: true, default: "Consultation" },
    title: { type: String },
    category: { type: String },
    details: { type: String },
    chiefComplaint: { type: String },
    historyOfPresentIllness: { type: String },
    objectiveFindings: { type: String },
    assessment: { type: String },
    plan: { type: String },
    severity: { type: String },
    reaction: { type: String },
    orderType: { type: String },
    referralTo: { type: String },
    followUpDate: { type: Date },
    priority: { type: String, default: "Routine" },
    instructions: { type: String },
    problemStatus: { type: String },
    resolutionDate: { type: Date },
    dateRecorded: { type: Date, default: Date.now },
    status: { type: String, enum: ["Draft", "Final"], default: "Final" },
  },
  { timestamps: true }
);

export const ClinicalRecord =
  mongoose.models.ClinicalRecord ||
  mongoose.model<IClinicalRecord>("ClinicalRecord", ClinicalRecordSchema);
