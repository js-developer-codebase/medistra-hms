import mongoose, { Schema, Document } from "mongoose";

export interface IBloodIssue extends Document {
  issueCode: string;
  requestId?: mongoose.Types.ObjectId;
  bagNumber: string;
  patientName: string;
  uhid?: string;
  recipientBloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  componentIssued: "PRBC" | "WHOLE_BLOOD" | "FFP" | "PLATELETS" | "CRYOPRECIPITATE";
  volumeMl: number;
  issuedToStaff: string;
  issuedToStaffId?: string;
  wardOrOT: string;
  issuedBy: string; // Blood Bank Incharge
  coldChainBoxVerified: boolean;
  crossmatchSlipVerified: boolean;
  dualNurseCheckVerified: boolean;
  processingFee: number; // in INR ₹
  issueDate: Date;
  transfusionVoucherNumber: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bloodIssueSchema = new Schema<IBloodIssue>(
  {
    issueCode: { type: String, required: true, unique: true },
    requestId: { type: Schema.Types.ObjectId, ref: "BloodRequest" },
    bagNumber: { type: String, required: true },
    patientName: { type: String, required: true },
    uhid: { type: String },
    recipientBloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    componentIssued: {
      type: String,
      required: true,
      enum: ["PRBC", "WHOLE_BLOOD", "FFP", "PLATELETS", "CRYOPRECIPITATE"],
      default: "PRBC"
    },
    volumeMl: { type: Number, required: true, default: 350 },
    issuedToStaff: { type: String, required: true },
    issuedToStaffId: { type: String },
    wardOrOT: { type: String, required: true, default: "Inpatient Ward" },
    issuedBy: { type: String, required: true, default: "Blood Bank Officer" },
    coldChainBoxVerified: { type: Boolean, default: true },
    crossmatchSlipVerified: { type: Boolean, default: true },
    dualNurseCheckVerified: { type: Boolean, default: true },
    processingFee: { type: Number, default: 1450 },
    issueDate: { type: Date, required: true, default: Date.now },
    transfusionVoucherNumber: { type: String, required: true },
    notes: { type: String }
  },
  { timestamps: true }
);

export const BloodIssue =
  mongoose.models.BloodIssue ||
  mongoose.model<IBloodIssue>("BloodIssue", bloodIssueSchema);

export default BloodIssue;
