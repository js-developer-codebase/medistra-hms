import mongoose, { Schema, Document } from "mongoose";

export interface ILabOrder extends Document {
  patient: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  tests: mongoose.Types.ObjectId[];
  status: string;
  orderDate: Date;
  priority: string;
  notes?: string;
  results: {
    test: mongoose.Types.ObjectId;
    value: string;
    remarks?: string;
    status: string;
  }[];
}

const labOrderSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    tests: [{ type: Schema.Types.ObjectId, ref: "LabTest", required: true }],
    status: {
      type: String,
      enum: ["Pending", "Sample Collected", "Processing", "Completed", "Cancelled"],
      default: "Pending",
    },
    orderDate: { type: Date, default: Date.now },
    priority: { type: String, enum: ["Routine", "Urgent", "STAT"], default: "Routine" },
    notes: { type: String },
    results: [
      {
        test: { type: Schema.Types.ObjectId, ref: "LabTest" },
        value: { type: String },
        remarks: { type: String },
        status: {
          type: String,
          enum: ["Pending", "Entered", "Verified"],
          default: "Pending",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.LabOrder || mongoose.model<ILabOrder>("LabOrder", labOrderSchema);
