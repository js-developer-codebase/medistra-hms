import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAttendance extends Document {
  userId: Types.ObjectId;
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  shiftType: "MORNING" | "EVENING" | "NIGHT" | "GENERAL";
  status: "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT" | "ON_LEAVE";
  workingHours?: number;
  location?: string;
  notes?: string;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    clockIn: {
      type: Date,
      required: true,
    },
    clockOut: {
      type: Date,
    },
    shiftType: {
      type: String,
      enum: ["MORNING", "EVENING", "NIGHT", "GENERAL"],
      default: "MORNING",
    },
    status: {
      type: String,
      enum: ["PRESENT", "LATE", "HALF_DAY", "ABSENT", "ON_LEAVE"],
      default: "PRESENT",
      index: true,
    },
    workingHours: {
      type: Number,
      default: 8,
    },
    location: {
      type: String,
      default: "Main Hospital - Block A Biometric Terminal",
    },
    notes: {
      type: String,
    },
    verifiedBy: {
      type: String,
      default: "Biometric Auto-Sync",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: false });

const Attendance =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;
