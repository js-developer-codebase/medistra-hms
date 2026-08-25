import mongoose, { Schema, Document } from "mongoose";

export interface IEmergencyTriage extends Document {
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  priority: "Red" | "Yellow" | "Green" | "Black";
  chiefComplaint: string;
  vitals: {
    bp: string;
    heartRate: number;
    temperature: number;
    spo2: number;
  };
  assignedDoctor?: mongoose.Types.ObjectId;
  status: "Waiting" | "In Treatment" | "Discharged" | "Admitted";
  notes?: string;
}

const emergencyTriageSchema = new Schema<IEmergencyTriage>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    priority: { type: String, enum: ["Red", "Yellow", "Green", "Black"], required: true },
    chiefComplaint: { type: String, required: true },
    vitals: {
      bp: { type: String },
      heartRate: { type: Number },
      temperature: { type: Number },
      spo2: { type: Number },
    },
    assignedDoctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    status: { type: String, enum: ["Waiting", "In Treatment", "Discharged", "Admitted"], default: "Waiting" },
    notes: { type: String },
  },
  { timestamps: true }
);

export const EmergencyTriage = mongoose.models.EmergencyTriage || mongoose.model<IEmergencyTriage>("EmergencyTriage", emergencyTriageSchema);
