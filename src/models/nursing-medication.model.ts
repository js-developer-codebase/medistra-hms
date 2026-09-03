import mongoose, { Schema, Document, Types } from "mongoose";

export interface INursingMedication extends Document {
  patient: Types.ObjectId;
  administeredBy?: Types.ObjectId;
  medicationName: string;
  dosage: string;
  route: "ORAL" | "IV" | "IM" | "SC" | "TOPICAL" | "INHALATION" | "OTHER";
  scheduledTime: Date;
  administeredTime?: Date;
  status: "GIVEN" | "PENDING" | "WITHHELD" | "REFUSED";
  withheldReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NursingMedicationSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    administeredBy: { type: Schema.Types.ObjectId, ref: "User" },
    medicationName: { type: String, required: true },
    dosage: { type: String, required: true },
    route: {
      type: String,
      enum: ["ORAL", "IV", "IM", "SC", "TOPICAL", "INHALATION", "OTHER"],
      default: "ORAL"
    },
    scheduledTime: { type: Date, default: Date.now },
    administeredTime: { type: Date },
    status: {
      type: String,
      enum: ["GIVEN", "PENDING", "WITHHELD", "REFUSED"],
      default: "PENDING"
    },
    withheldReason: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

const NursingMedication =
  mongoose.models.NursingMedication ||
  mongoose.model<INursingMedication>("NursingMedication", NursingMedicationSchema);

export default NursingMedication;
