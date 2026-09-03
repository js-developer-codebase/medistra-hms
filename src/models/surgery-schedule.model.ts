import mongoose, { Schema, Document } from "mongoose";

export interface ISurgerySchedule extends Document {
  surgeryCode: string;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  surgeryName: string;
  specialty:
    | "Cardiothoracic"
    | "Neurosurgery"
    | "Orthopedics"
    | "General & GI Surgery"
    | "Obstetrics & Gynaecology"
    | "Urology"
    | "Oncology"
    | "ENT"
    | "Plastic Surgery"
    | "Other";
  surgeon: string; // Primary Surgeon
  assistantSurgeon?: string;
  anesthesiologist?: string;
  scrubNurse?: string;
  circulatingNurse?: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  otRoom: string;
  anesthesiaType:
    | "General Anesthesia (GA)"
    | "Spinal Anesthesia"
    | "Epidural"
    | "Regional Nerve Block"
    | "Local Anesthesia / MAC";
  asaGrade?: "ASA I" | "ASA II" | "ASA III" | "ASA IV" | "ASA V" | "ASA E (Emergency)";
  urgency: "ELECTIVE" | "URGENT" | "EMERGENCY_STAT";
  preOpCleared: boolean;
  estimatedCost: number; // in INR ₹
  status: "Scheduled" | "In Progress" | "Completed" | "Recovery" | "Cancelled";
  preOpNotes?: string;
  postOpNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const surgeryScheduleSchema = new Schema<ISurgerySchedule>(
  {
    surgeryCode: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    surgeryName: { type: String, required: true },
    specialty: {
      type: String,
      enum: [
        "Cardiothoracic",
        "Neurosurgery",
        "Orthopedics",
        "General & GI Surgery",
        "Obstetrics & Gynaecology",
        "Urology",
        "Oncology",
        "ENT",
        "Plastic Surgery",
        "Other"
      ],
      default: "General & GI Surgery"
    },
    surgeon: { type: String, required: true },
    assistantSurgeon: { type: String },
    anesthesiologist: { type: String },
    scrubNurse: { type: String },
    circulatingNurse: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true, default: 90 },
    otRoom: { type: String, required: true, default: "OT 1 - Main Suite" },
    anesthesiaType: {
      type: String,
      enum: [
        "General Anesthesia (GA)",
        "Spinal Anesthesia",
        "Epidural",
        "Regional Nerve Block",
        "Local Anesthesia / MAC"
      ],
      default: "General Anesthesia (GA)"
    },
    asaGrade: {
      type: String,
      enum: ["ASA I", "ASA II", "ASA III", "ASA IV", "ASA V", "ASA E (Emergency)"],
      default: "ASA II"
    },
    urgency: {
      type: String,
      enum: ["ELECTIVE", "URGENT", "EMERGENCY_STAT"],
      default: "ELECTIVE"
    },
    preOpCleared: { type: Boolean, default: false },
    estimatedCost: { type: Number, default: 25000 },
    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Recovery", "Cancelled"],
      default: "Scheduled"
    },
    preOpNotes: { type: String },
    postOpNotes: { type: String }
  },
  { timestamps: true }
);

export const SurgerySchedule =
  mongoose.models.SurgerySchedule ||
  mongoose.model<ISurgerySchedule>("SurgerySchedule", surgeryScheduleSchema);

export default SurgerySchedule;
