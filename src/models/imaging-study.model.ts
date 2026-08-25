import mongoose, { Schema, Document } from "mongoose";

export interface IImagingStudy extends Document {
  order: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  technician: mongoose.Types.ObjectId;
  radiologist?: mongoose.Types.ObjectId;
  imageUrls: string[];
  report?: string;
  status: "IN_PROGRESS" | "IMAGES_UPLOADED" | "REPORT_DRAFTED" | "FINALIZED";
  createdAt: Date;
  updatedAt: Date;
}

const ImagingStudySchema: Schema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "RadiologyOrder", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    technician: { type: Schema.Types.ObjectId, ref: "User", required: true },
    radiologist: { type: Schema.Types.ObjectId, ref: "User" },
    imageUrls: [{ type: String }],
    report: { type: String },
    status: { type: String, enum: ["IN_PROGRESS", "IMAGES_UPLOADED", "REPORT_DRAFTED", "FINALIZED"], default: "IN_PROGRESS" },
  },
  { timestamps: true }
);

export default mongoose.models.ImagingStudy || mongoose.model<IImagingStudy>("ImagingStudy", ImagingStudySchema);
