import mongoose, { Schema, Document } from "mongoose";

export interface IRadiologyOrder extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  studyType: string;
  clinicalNotes: string;
  priority: "ROUTINE" | "URGENT" | "STAT";
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const RadiologyOrderSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studyType: { type: String, required: true },
    clinicalNotes: { type: String },
    priority: { type: String, enum: ["ROUTINE", "URGENT", "STAT"], default: "ROUTINE" },
    status: { type: String, enum: ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"], default: "PENDING" },
  },
  { timestamps: true }
);

export default mongoose.models.RadiologyOrder || mongoose.model<IRadiologyOrder>("RadiologyOrder", RadiologyOrderSchema);
