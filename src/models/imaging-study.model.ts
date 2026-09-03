import mongoose, { Schema, Document, Types } from "mongoose";

export interface IImagingStudy extends Document {
  order: Types.ObjectId;
  patient: Types.ObjectId;
  technician?: Types.ObjectId | string;
  radiologist?: Types.ObjectId | string;
  accessionNumber?: string;
  modality?: string;
  bodyPart?: string;
  seriesCount?: number;
  instanceCount?: number;
  imageUrls: string[];
  technicianNotes?: string;
  technique?: string;
  findings?: string;
  impression?: string;
  recommendations?: string;
  isCritical?: boolean;
  criticalNotifiedTo?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  status: "SCHEDULED" | "IN_PROGRESS" | "IMAGES_UPLOADED" | "REPORT_DRAFTED" | "FINALIZED";
  createdAt: Date;
  updatedAt: Date;
}

const ImagingStudySchema: Schema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "RadiologyOrder", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    technician: { type: Schema.Types.Mixed },
    radiologist: { type: Schema.Types.Mixed },
    accessionNumber: { type: String, index: true },
    modality: { type: String, default: "X-RAY" },
    bodyPart: { type: String, default: "Chest" },
    seriesCount: { type: Number, default: 1 },
    instanceCount: { type: Number, default: 2 },
    imageUrls: [{ type: String }],
    technicianNotes: { type: String },
    technique: { type: String },
    findings: { type: String },
    impression: { type: String },
    recommendations: { type: String },
    isCritical: { type: Boolean, default: false },
    criticalNotifiedTo: { type: String },
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "IMAGES_UPLOADED", "REPORT_DRAFTED", "FINALIZED"],
      default: "IN_PROGRESS"
    }
  },
  { timestamps: true }
);

export default mongoose.models.ImagingStudy ||
  mongoose.model<IImagingStudy>("ImagingStudy", ImagingStudySchema);
