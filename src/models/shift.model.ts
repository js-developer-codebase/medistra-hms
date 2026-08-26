import mongoose, { Schema, Document } from "mongoose";

export interface IShift extends Document {
  user: mongoose.Types.ObjectId;
  ward: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  shiftType: "MORNING" | "EVENING" | "NIGHT";
  status: "SCHEDULED" | "ONGOING" | "COMPLETED";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ward: { type: Schema.Types.ObjectId, ref: "Ward" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    shiftType: { type: String, enum: ["MORNING", "EVENING", "NIGHT"], required: true },
    status: { type: String, enum: ["SCHEDULED", "ONGOING", "COMPLETED"], default: "SCHEDULED" },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Shift || mongoose.model<IShift>("Shift", ShiftSchema);
