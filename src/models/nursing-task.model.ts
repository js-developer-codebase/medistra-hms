import mongoose, { Schema, Document, Types } from "mongoose";

export interface INursingTask extends Document {
  patient: Types.ObjectId;
  ward?: Types.ObjectId;
  assignedNurse?: Types.ObjectId;
  taskName: string;
  category: string;
  priority: "ROUTINE" | "URGENT" | "STAT";
  dueDate: Date;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  completedAt?: Date;
  completedBy?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NursingTaskSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    ward: { type: Schema.Types.ObjectId, ref: "Ward" },
    assignedNurse: { type: Schema.Types.ObjectId, ref: "User" },
    taskName: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Wound Care",
        "Medication / IV",
        "Catheter / Drain",
        "Monitoring",
        "Hygiene / Nursing Care",
        "Respiratory / Nebulization",
        "Diagnostic / Specimen",
        "Other"
      ],
      default: "Nursing Care"
    },
    priority: { type: String, enum: ["ROUTINE", "URGENT", "STAT"], default: "ROUTINE" },
    dueDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PENDING"
    },
    completedAt: { type: Date },
    completedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String }
  },
  { timestamps: true }
);

const NursingTask =
  mongoose.models.NursingTask || mongoose.model<INursingTask>("NursingTask", NursingTaskSchema);

export default NursingTask;
