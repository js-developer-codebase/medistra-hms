import mongoose, { Schema, Document } from "mongoose";

export interface IIntraOpRecord extends Document {
  recordCode: string;
  surgeryScheduleId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  surgeryName: string;
  otRoom: string;
  timeOutConfirmed: boolean;
  incisionTime: string;
  closureTime: string;
  operatingSurgeon: string;
  assistantSurgeon?: string;
  anesthetist: string;
  scrubNurse: string;
  circulatingNurse: string;
  surgicalFindings: string;
  procedureDescription: string;
  implantsOrProsthetics?: string;
  estimatedBloodLoss: number; // in ml
  bloodTransfusedUnits: number;
  urineOutput: number; // in ml
  swabCountCorrect: boolean; // WHO Sign-out
  needleAndInstrumentCountCorrect: boolean; // WHO Sign-out
  specimenSentToBiopsy: boolean;
  specimenDetails?: string;
  drainsPlaced?: string;
  intraopComplications?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const intraOpRecordSchema = new Schema<IIntraOpRecord>(
  {
    recordCode: { type: String, required: true, unique: true },
    surgeryScheduleId: { type: Schema.Types.ObjectId, ref: "SurgerySchedule" },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    surgeryName: { type: String, required: true },
    otRoom: { type: String, required: true },
    timeOutConfirmed: { type: Boolean, default: true },
    incisionTime: { type: String, required: true },
    closureTime: { type: String, required: true },
    operatingSurgeon: { type: String, required: true },
    assistantSurgeon: { type: String },
    anesthetist: { type: String, required: true },
    scrubNurse: { type: String, required: true },
    circulatingNurse: { type: String, required: true },
    surgicalFindings: { type: String, required: true },
    procedureDescription: { type: String, required: true },
    implantsOrProsthetics: { type: String },
    estimatedBloodLoss: { type: Number, default: 100 },
    bloodTransfusedUnits: { type: Number, default: 0 },
    urineOutput: { type: Number, default: 200 },
    swabCountCorrect: { type: Boolean, default: true },
    needleAndInstrumentCountCorrect: { type: Boolean, default: true },
    specimenSentToBiopsy: { type: Boolean, default: false },
    specimenDetails: { type: String },
    drainsPlaced: { type: String, default: "None" },
    intraopComplications: { type: String, default: "None" }
  },
  { timestamps: true }
);

export const IntraOpRecord =
  mongoose.models.IntraOpRecord ||
  mongoose.model<IIntraOpRecord>("IntraOpRecord", intraOpRecordSchema);

export default IntraOpRecord;
