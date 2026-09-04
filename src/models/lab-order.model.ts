import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILabResultItem {
  _id?: Types.ObjectId;
  test: Types.ObjectId;
  value: string;
  unit?: string;
  normalRange?: string;
  isAbnormal?: boolean;
  flag?: "Normal" | "Low" | "High" | "Critical";
  remarks?: string;
  status: "Pending" | "Entered" | "Verified";
}

export interface ILabOrder extends Document {
  patient: Types.ObjectId;
  doctor?: Types.ObjectId;
  tests: Types.ObjectId[];
  status: "Pending" | "Sample Collected" | "Processing" | "Completed" | "Cancelled";
  orderDate: Date;
  priority: "Routine" | "Urgent" | "STAT";
  notes?: string;
  barcode?: string;
  sampleType?: string;
  sampleCollectedAt?: Date;
  sampleCollectedBy?: string;
  sampleCondition?: string;
  receivedInLabAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  results: ILabResultItem[];
  createdAt: Date;
  updatedAt: Date;
}

const LabResultItemSchema = new Schema(
  {
    test: { type: Schema.Types.ObjectId, ref: "LabTest", required: true },
    value: { type: String, default: "" },
    unit: { type: String },
    normalRange: { type: String },
    isAbnormal: { type: Boolean, default: false },
    flag: {
      type: String,
      enum: ["Normal", "Low", "High", "Critical"],
      default: "Normal"
    },
    remarks: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Entered", "Verified"],
      default: "Pending"
    }
  },
  { _id: true }
);

const labOrderSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    tests: [{ type: Schema.Types.ObjectId, ref: "LabTest", required: true }],
    status: {
      type: String,
      enum: ["Pending", "Sample Collected", "Processing", "Completed", "Cancelled"],
      default: "Pending"
    },
    orderDate: { type: Date, default: Date.now },
    priority: { type: String, enum: ["Routine", "Urgent", "STAT"], default: "Routine" },
    notes: { type: String },
    barcode: { type: String, index: true },
    sampleType: { type: String, default: "Whole Blood (EDTA)" },
    sampleCollectedAt: { type: Date },
    sampleCollectedBy: { type: String },
    sampleCondition: { type: String, default: "Adequate" },
    receivedInLabAt: { type: Date },
    verifiedAt: { type: Date },
    verifiedBy: { type: String },
    results: [LabResultItemSchema]
  },
  { timestamps: true }
);

const LabOrder =
  mongoose.models.LabOrder || mongoose.model<ILabOrder>("LabOrder", labOrderSchema);

export default LabOrder;
