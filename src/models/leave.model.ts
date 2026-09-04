import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILeave extends Document {
  userId: Types.ObjectId;
  leaveType: "CASUAL" | "SICK" | "EARNED" | "MATERNITY" | "PATERNITY" | "UNPAID";
  startDate: Date;
  endDate: Date;
  daysCount: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  appliedAt: Date;
  approvedBy?: Types.ObjectId;
  actionDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<ILeave>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ["CASUAL", "SICK", "EARNED", "MATERNITY", "PATERNITY", "UNPAID"],
      required: true,
      default: "CASUAL",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    daysCount: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    actionDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

const Leave = mongoose.models.Leave || mongoose.model<ILeave>("Leave", leaveSchema);

export default Leave;
