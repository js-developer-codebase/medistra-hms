import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStaff extends Document {
  userId: Types.ObjectId;
  employeeId: string;
  departmentId?: Types.ObjectId;
  designationId?: Types.ObjectId;
  role: string;
  qualification?: string;
  joiningDate?: Date;
  shift: "MORNING" | "EVENING" | "NIGHT" | "ROTATING";
  phone?: string;
  emergencyContact?: string;
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
  salary?: number; // Monthly base compensation in ₹
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    designationId: {
      type: Schema.Types.ObjectId,
      ref: "Designation",
    },
    role: {
      type: String,
      required: true,
      trim: true,
      default: "NURSE",
    },
    qualification: {
      type: String,
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    shift: {
      type: String,
      enum: ["MORNING", "EVENING", "NIGHT", "ROTATING"],
      default: "MORNING",
    },
    phone: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ON_LEAVE"],
      default: "ACTIVE",
    },
    salary: {
      type: Number,
      default: 35000,
    },
    bankName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      trim: true,
    },
    panNumber: {
      type: String,
      trim: true,
    },
    aadhaarNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Staff =
  mongoose.models.Staff || mongoose.model<IStaff>("Staff", staffSchema);

export default Staff;
