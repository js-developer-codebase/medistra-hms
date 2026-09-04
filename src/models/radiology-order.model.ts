import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRadiologyOrder extends Document {
  patient: Types.ObjectId;
  doctor?: Types.ObjectId;
  procedure?: Types.ObjectId;
  studyType: string;
  modality: "X-RAY" | "CT" | "MRI" | "ULTRASOUND" | "MAMMOGRAPHY" | "DEXA" | "FLUOROSCOPY" | "PET-CT";
  bodyPart: string;
  accessionNumber?: string;
  contrast?: boolean;
  pregnancyStatus?: string;
  price?: number;
  clinicalNotes?: string;
  priority: "ROUTINE" | "URGENT" | "STAT";
  status: "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  scheduledDate?: Date;
  technician?: Types.ObjectId;
  radiologist?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RadiologyOrderSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    procedure: { type: Schema.Types.ObjectId, ref: "RadiologyProcedure" },
    studyType: { type: String, required: true },
    modality: {
      type: String,
      enum: ["X-RAY", "CT", "MRI", "ULTRASOUND", "MAMMOGRAPHY", "DEXA", "FLUOROSCOPY", "PET-CT"],
      default: "X-RAY"
    },
    bodyPart: { type: String, default: "Chest" },
    accessionNumber: { type: String, index: true },
    contrast: { type: Boolean, default: false },
    pregnancyStatus: { type: String, default: "Not Applicable" },
    price: { type: Number, default: 800 },
    clinicalNotes: { type: String },
    priority: { type: String, enum: ["ROUTINE", "URGENT", "STAT"], default: "ROUTINE" },
    status: {
      type: String,
      enum: ["PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PENDING"
    },
    scheduledDate: { type: Date },
    technician: { type: Schema.Types.ObjectId, ref: "User" },
    radiologist: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.models.RadiologyOrder ||
  mongoose.model<IRadiologyOrder>("RadiologyOrder", RadiologyOrderSchema);
