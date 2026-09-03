import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPatientHandover {
  patient: Types.ObjectId;
  bedNumber?: string;
  situation: string; // Current clinical status / main issue
  background: string; // Admitting diagnosis / past history
  assessment: string; // Recent vitals / lab results / concerns
  recommendation: string; // Next shift action items / to-dos
}

export interface INursingHandover extends Document {
  ward: Types.ObjectId;
  shiftType: "MORNING" | "EVENING" | "NIGHT";
  handoverDate: Date;
  outgoingNurse: Types.ObjectId;
  incomingNurse?: Types.ObjectId;
  patientHandovers: IPatientHandover[];
  generalWardRemarks?: string;
  status: "DRAFT" | "SUBMITTED" | "ACKNOWLEDGED";
  createdAt: Date;
  updatedAt: Date;
}

const PatientHandoverItemSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    bedNumber: { type: String },
    situation: { type: String, required: true },
    background: { type: String },
    assessment: { type: String },
    recommendation: { type: String }
  },
  { _id: true }
);

const NursingHandoverSchema = new Schema(
  {
    ward: { type: Schema.Types.ObjectId, ref: "Ward", required: true },
    shiftType: { type: String, enum: ["MORNING", "EVENING", "NIGHT"], required: true },
    handoverDate: { type: Date, default: Date.now },
    outgoingNurse: { type: Schema.Types.ObjectId, ref: "User", required: true },
    incomingNurse: { type: Schema.Types.ObjectId, ref: "User" },
    patientHandovers: [PatientHandoverItemSchema],
    generalWardRemarks: { type: String },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "ACKNOWLEDGED"],
      default: "SUBMITTED"
    }
  },
  { timestamps: true }
);

const NursingHandover =
  mongoose.models.NursingHandover ||
  mongoose.model<INursingHandover>("NursingHandover", NursingHandoverSchema);

export default NursingHandover;
