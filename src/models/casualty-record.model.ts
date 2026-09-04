import mongoose, { Schema, Document } from "mongoose";

export interface ICasualtyRecord extends Document {
  caseNumber: string;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  contactNumber?: string;
  arrivalTime: Date;
  modeOfArrival: "Ambulance" | "Walk-in" | "Police" | "Transfer" | "Other";
  broughtBy?: string;
  broughtByPhone?: string;
  attendantRelation?: string;
  isMLC: boolean;
  mlcNumber?: string;
  policeStation?: string;
  constableDetails?: string;
  chiefComplaints: string;
  initialAssessment: string;
  triageId?: mongoose.Types.ObjectId;
  triagePriority?: "Red" | "Orange" | "Yellow" | "Green" | "Black";
  assignedBay?: string;
  assignedDoctor?: mongoose.Types.ObjectId;
  status:
    | "REGISTERED"
    | "TRIAGED"
    | "IN_CONSULTATION"
    | "UNDER_TREATMENT"
    | "ADMITTED"
    | "DISCHARGED"
    | "TRANSFERRED"
    | "EXPIRED";
  dispositionNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const casualtyRecordSchema = new Schema<ICasualtyRecord>(
  {
    caseNumber: { type: String, required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    contactNumber: { type: String },
    arrivalTime: { type: Date, required: true, default: Date.now },
    modeOfArrival: {
      type: String,
      enum: ["Ambulance", "Walk-in", "Police", "Transfer", "Other"],
      required: true,
      default: "Walk-in"
    },
    broughtBy: { type: String },
    broughtByPhone: { type: String },
    attendantRelation: { type: String },
    isMLC: { type: Boolean, default: false },
    mlcNumber: { type: String },
    policeStation: { type: String },
    constableDetails: { type: String },
    chiefComplaints: { type: String, required: true },
    initialAssessment: { type: String, required: true },
    triageId: { type: Schema.Types.ObjectId, ref: "EmergencyTriage" },
    triagePriority: {
      type: String,
      enum: ["Red", "Orange", "Yellow", "Green", "Black"],
      default: "Yellow"
    },
    assignedBay: { type: String, default: "Acute Bay 1" },
    assignedDoctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    status: {
      type: String,
      enum: [
        "REGISTERED",
        "TRIAGED",
        "IN_CONSULTATION",
        "UNDER_TREATMENT",
        "ADMITTED",
        "DISCHARGED",
        "TRANSFERRED",
        "EXPIRED"
      ],
      default: "REGISTERED"
    },
    dispositionNotes: { type: String }
  },
  { timestamps: true }
);

export const CasualtyRecord =
  mongoose.models.CasualtyRecord ||
  mongoose.model<ICasualtyRecord>("CasualtyRecord", casualtyRecordSchema);

export default CasualtyRecord;
