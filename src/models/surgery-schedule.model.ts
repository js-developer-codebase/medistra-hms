import mongoose, { Schema, Document } from "mongoose";

export interface ISurgerySchedule extends Document {
  patientId?: mongoose.Types.ObjectId;
  patientName: string;
  surgeryName: string;
  surgeon: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  otRoom: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
}

const surgeryScheduleSchema = new Schema<ISurgerySchedule>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    patientName: { type: String, required: true },
    surgeryName: { type: String, required: true },
    surgeon: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true },
    otRoom: { type: String, required: true },
    status: { type: String, enum: ["Scheduled", "In Progress", "Completed", "Cancelled"], default: "Scheduled" },
  },
  { timestamps: true }
);

export const SurgerySchedule = mongoose.models.SurgerySchedule || mongoose.model<ISurgerySchedule>("SurgerySchedule", surgeryScheduleSchema);
