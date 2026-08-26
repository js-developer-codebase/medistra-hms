import mongoose, { Schema, Document } from "mongoose";

export interface ICasualtyRecord extends Document {
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  arrivalTime: Date;
  modeOfArrival: "Ambulance" | "Walk-in" | "Police" | "Other";
  broughtBy?: string;
  initialAssessment: string;
  triageId?: mongoose.Types.ObjectId;
}

const casualtyRecordSchema = new Schema<ICasualtyRecord>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    arrivalTime: { type: Date, required: true, default: Date.now },
    modeOfArrival: { type: String, enum: ["Ambulance", "Walk-in", "Police", "Other"], required: true },
    broughtBy: { type: String },
    initialAssessment: { type: String, required: true },
    triageId: { type: Schema.Types.ObjectId, ref: "EmergencyTriage" },
  },
  { timestamps: true }
);

export const CasualtyRecord = mongoose.models.CasualtyRecord || mongoose.model<ICasualtyRecord>("CasualtyRecord", casualtyRecordSchema);
