import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStaffDocument extends Document {
  userId: Types.ObjectId;
  documentType:
    | "ID_PROOF"
    | "MEDICAL_LICENSE"
    | "DEGREE_CERTIFICATE"
    | "APPOINTMENT_LETTER"
    | "EXPERIENCE_CERTIFICATE"
    | "POLICE_VERIFICATION"
    | "OTHER";
  title: string;
  documentNumber?: string;
  fileUrl: string;
  issueDate?: Date;
  expiryDate?: Date;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const staffDocumentSchema = new Schema<IStaffDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: [
        "ID_PROOF",
        "MEDICAL_LICENSE",
        "DEGREE_CERTIFICATE",
        "APPOINTMENT_LETTER",
        "EXPERIENCE_CERTIFICATE",
        "POLICE_VERIFICATION",
        "OTHER",
      ],
      required: true,
      default: "ID_PROOF",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    documentNumber: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      default: "/documents/sample-staff-document.pdf",
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

const StaffDocument =
  mongoose.models.StaffDocument ||
  mongoose.model<IStaffDocument>("StaffDocument", staffDocumentSchema);

export default StaffDocument;
