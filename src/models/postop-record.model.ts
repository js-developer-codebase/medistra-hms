import mongoose, { Schema, Document } from "mongoose";

export interface IPostOpRecord extends Document {
  recordCode: string;
  surgeryScheduleId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  uhid?: string;
  surgeryName: string;
  pacuArrivalTime: Date;
  aldreteScore: number; // 0 to 10 scale
  aldreteBreakdown: {
    activity: number; // 0, 1, 2
    respiration: number; // 0, 1, 2
    circulation: number; // 0, 1, 2
    consciousness: number; // 0, 1, 2
    o2Saturation: number; // 0, 1, 2
  };
  vitals: {
    bp: string;
    heartRate: number;
    spo2: number;
    respiratoryRate: number;
    temperature: number;
    painScore: number; // 0 to 10
  };
  drainOutputMl: number;
  postOpAnalgesia: string;
  antibioticCover: string;
  transferDestination: "ICU" | "HDU" | "Inpatient Ward" | "Daycare Discharge";
  dischargeClearanceStatus:
    | "In Recovery / Monitoring"
    | "Cleared for Ward"
    | "Cleared for ICU"
    | "Discharged";
  clearedByAnesthetist: string;
  recoveryNotes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const postOpRecordSchema = new Schema<IPostOpRecord>(
  {
    recordCode: { type: String, required: true, unique: true },
    surgeryScheduleId: { type: Schema.Types.ObjectId, ref: "SurgerySchedule" },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    uhid: { type: String },
    surgeryName: { type: String, required: true },
    pacuArrivalTime: { type: Date, default: Date.now },
    aldreteScore: { type: Number, required: true, min: 0, max: 10, default: 9 },
    aldreteBreakdown: {
      activity: { type: Number, default: 2 },
      respiration: { type: Number, default: 2 },
      circulation: { type: Number, default: 2 },
      consciousness: { type: Number, default: 2 },
      o2Saturation: { type: Number, default: 1 }
    },
    vitals: {
      bp: { type: String, default: "124/78" },
      heartRate: { type: Number, default: 76 },
      spo2: { type: Number, default: 98 },
      respiratoryRate: { type: Number, default: 16 },
      temperature: { type: Number, default: 98.4 },
      painScore: { type: Number, default: 2 }
    },
    drainOutputMl: { type: Number, default: 30 },
    postOpAnalgesia: { type: String, default: "IV Paracetamol 1g Q8H, IV Tramadol 50mg SOS" },
    antibioticCover: { type: String, default: "IV Cefuroxime 1.5g BD" },
    transferDestination: {
      type: String,
      enum: ["ICU", "HDU", "Inpatient Ward", "Daycare Discharge"],
      default: "Inpatient Ward"
    },
    dischargeClearanceStatus: {
      type: String,
      enum: [
        "In Recovery / Monitoring",
        "Cleared for Ward",
        "Cleared for ICU",
        "Discharged"
      ],
      default: "Cleared for Ward"
    },
    clearedByAnesthetist: { type: String, default: "Dr. Anesthesiologist" },
    recoveryNotes: { type: String, default: "Patient awake, extubated, obeying commands smoothly." }
  },
  { timestamps: true }
);

export const PostOpRecord =
  mongoose.models.PostOpRecord ||
  mongoose.model<IPostOpRecord>("PostOpRecord", postOpRecordSchema);

export default PostOpRecord;
