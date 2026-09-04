import mongoose, { Schema, Document } from "mongoose";

export interface IPreOpChecklist extends Document {
  checklistCode: string;
  surgeryScheduleId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  surgeryName: string;
  // WHO Sign-in safety verification
  patientIdentityConfirmed: boolean;
  surgicalSiteMarked: boolean;
  consentConfirmed: boolean;
  anesthesiaMachineChecked: boolean;
  pulseOximeterFunctioning: boolean;
  knownAllergy: boolean;
  allergyDetails?: string;
  difficultAirwayRisk: boolean;
  bloodLossRiskOver500ml: boolean;
  bloodUnitsArranged: number;
  npoFastingHours: number;
  premedicationGiven: boolean;
  asaGrade: "ASA I" | "ASA II" | "ASA III" | "ASA IV" | "ASA V" | "ASA E" | "ASA E (Emergency)";
  pacCleared: boolean;
  verifiedByNurse: string;
  verifiedByAnesthetist: string;
  status: "COMPLIANT" | "INCOMPLETE" | "HOLD";
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const preOpChecklistSchema = new Schema<IPreOpChecklist>(
  {
    checklistCode: { type: String, required: true, unique: true },
    surgeryScheduleId: { type: Schema.Types.ObjectId, ref: "SurgerySchedule" },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    surgeryName: { type: String, required: true },
    patientIdentityConfirmed: { type: Boolean, default: true },
    surgicalSiteMarked: { type: Boolean, default: true },
    consentConfirmed: { type: Boolean, default: true },
    anesthesiaMachineChecked: { type: Boolean, default: true },
    pulseOximeterFunctioning: { type: Boolean, default: true },
    knownAllergy: { type: Boolean, default: false },
    allergyDetails: { type: String, default: "No known drug allergies (NKDA)" },
    difficultAirwayRisk: { type: Boolean, default: false },
    bloodLossRiskOver500ml: { type: Boolean, default: false },
    bloodUnitsArranged: { type: Number, default: 0 },
    npoFastingHours: { type: Number, default: 8 },
    premedicationGiven: { type: Boolean, default: true },
    asaGrade: {
      type: String,
      enum: ["ASA I", "ASA II", "ASA III", "ASA IV", "ASA V", "ASA E", "ASA E (Emergency)"],
      default: "ASA II"
    },
    pacCleared: { type: Boolean, default: true },
    verifiedByNurse: { type: String, default: "Sr. Pre-Op Staff Nurse" },
    verifiedByAnesthetist: { type: String, default: "Dr. Anesthesiologist" },
    status: {
      type: String,
      enum: ["COMPLIANT", "INCOMPLETE", "HOLD"],
      default: "COMPLIANT"
    },
    notes: { type: String }
  },
  { timestamps: true }
);

export const PreOpChecklist =
  mongoose.models.PreOpChecklist ||
  mongoose.model<IPreOpChecklist>("PreOpChecklist", preOpChecklistSchema);

export default PreOpChecklist;
