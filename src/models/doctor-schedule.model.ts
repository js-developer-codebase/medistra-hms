import mongoose, { Schema, Document, Types } from "mongoose";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface IDoctorSchedule extends Document {
  doctorId: Types.ObjectId;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  maxPatients?: number;
  slotDurationMinutes?: number;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const doctorScheduleSchema = new Schema<IDoctorSchedule>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      default: "09:00",
    },
    endTime: {
      type: String,
      required: true,
      default: "17:00",
    },
    roomNumber: {
      type: String,
      trim: true,
      default: "OPD-101",
    },
    maxPatients: {
      type: Number,
      default: 20,
    },
    slotDurationMinutes: {
      type: Number,
      default: 15,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ON_LEAVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

const DoctorSchedule =
  mongoose.models.DoctorSchedule ||
  mongoose.model<IDoctorSchedule>("DoctorSchedule", doctorScheduleSchema);

export default DoctorSchedule;
