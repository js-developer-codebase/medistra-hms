import mongoose, { Schema, Document } from "mongoose";

export interface IEmergencyTreatment extends Document {
  treatmentCode: string;
  casualtyId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  procedureCategory:
    | "RESUSCITATION"
    | "AIRWAY"
    | "WOUND_TRAUMA"
    | "VASCULAR_ACCESS"
    | "MEDICATION_ADMIN"
    | "ORTHOPEDIC"
    | "OTHER";
  procedureName: string;
  performedBy: string;
  assistedBy?: string;
  performedAt: Date;
  equipmentUsed?: string;
  medicationsGiven?: string;
  complications?: string;
  outcomeNotes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const emergencyTreatmentSchema = new Schema<IEmergencyTreatment>(
  {
    treatmentCode: { type: String, required: true, unique: true },
    casualtyId: { type: Schema.Types.ObjectId, ref: "CasualtyRecord" },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    procedureCategory: {
      type: String,
      enum: [
        "RESUSCITATION",
        "AIRWAY",
        "WOUND_TRAUMA",
        "VASCULAR_ACCESS",
        "MEDICATION_ADMIN",
        "ORTHOPEDIC",
        "OTHER"
      ],
      required: true,
      default: "WOUND_TRAUMA"
    },
    procedureName: { type: String, required: true },
    performedBy: { type: String, required: true, default: "ER Medical Officer" },
    assistedBy: { type: String },
    performedAt: { type: Date, default: Date.now },
    equipmentUsed: { type: String },
    medicationsGiven: { type: String },
    complications: { type: String, default: "None documented" },
    outcomeNotes: { type: String, required: true }
  },
  { timestamps: true }
);

export const EmergencyTreatment =
  mongoose.models.EmergencyTreatment ||
  mongoose.model<IEmergencyTreatment>("EmergencyTreatment", emergencyTreatmentSchema);

export default EmergencyTreatment;
