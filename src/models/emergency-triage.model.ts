import mongoose, { Schema, Document } from "mongoose";

export interface IEmergencyTriage extends Document {
  casualtyId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  esiLevel:
    | "Level 1 - Resuscitation"
    | "Level 2 - Emergent"
    | "Level 3 - Urgent"
    | "Level 4 - Less Urgent"
    | "Level 5 - Non-urgent";
  priority: "Red" | "Orange" | "Yellow" | "Green" | "Black";
  chiefComplaint: string;
  vitals: {
    bp?: string;
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    spo2?: number;
    gcsScore?: number;
    painScale?: number;
    bloodGlucose?: number;
  };
  primarySurvey?: {
    airway?: "Patent" | "Compromised" | "Intubated";
    breathing?: "Normal" | "Dyspneic" | "Tachypneic" | "Absent";
    circulation?: "Stable" | "Tachycardic" | "Shock / Hypotensive" | "Arrest";
    disability?: "Alert" | "Responds to Voice" | "Responds to Pain" | "Unresponsive";
    exposure?: "Normal" | "Poly-trauma / Hemorrhage" | "Hypothermia";
  };
  assignedBay?: string;
  assignedDoctor?: mongoose.Types.ObjectId;
  triagedBy?: string;
  status: "Waiting" | "In Treatment" | "Discharged" | "Admitted";
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const emergencyTriageSchema = new Schema<IEmergencyTriage>(
  {
    casualtyId: { type: Schema.Types.ObjectId, ref: "CasualtyRecord" },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    esiLevel: {
      type: String,
      enum: [
        "Level 1 - Resuscitation",
        "Level 2 - Emergent",
        "Level 3 - Urgent",
        "Level 4 - Less Urgent",
        "Level 5 - Non-urgent"
      ],
      default: "Level 3 - Urgent"
    },
    priority: {
      type: String,
      enum: ["Red", "Orange", "Yellow", "Green", "Black"],
      required: true,
      default: "Yellow"
    },
    chiefComplaint: { type: String, required: true },
    vitals: {
      bp: { type: String, default: "120/80" },
      heartRate: { type: Number, default: 78 },
      respiratoryRate: { type: Number, default: 18 },
      temperature: { type: Number, default: 98.6 },
      spo2: { type: Number, default: 98 },
      gcsScore: { type: Number, default: 15 },
      painScale: { type: Number, default: 0 },
      bloodGlucose: { type: Number, default: 110 }
    },
    primarySurvey: {
      airway: {
        type: String,
        enum: ["Patent", "Compromised", "Intubated"],
        default: "Patent"
      },
      breathing: {
        type: String,
        enum: ["Normal", "Dyspneic", "Tachypneic", "Absent"],
        default: "Normal"
      },
      circulation: {
        type: String,
        enum: ["Stable", "Tachycardic", "Shock / Hypotensive", "Arrest"],
        default: "Stable"
      },
      disability: {
        type: String,
        enum: ["Alert", "Responds to Voice", "Responds to Pain", "Unresponsive"],
        default: "Alert"
      },
      exposure: {
        type: String,
        enum: ["Normal", "Poly-trauma / Hemorrhage", "Hypothermia"],
        default: "Normal"
      }
    },
    assignedBay: { type: String, default: "Acute Bay 1" },
    assignedDoctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    triagedBy: { type: String, default: "Triage Nurse" },
    status: {
      type: String,
      enum: ["Waiting", "In Treatment", "Discharged", "Admitted"],
      default: "Waiting"
    },
    notes: { type: String }
  },
  { timestamps: true }
);

export const EmergencyTriage =
  mongoose.models.EmergencyTriage ||
  mongoose.model<IEmergencyTriage>("EmergencyTriage", emergencyTriageSchema);

export default EmergencyTriage;
