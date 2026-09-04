import mongoose, { Schema, Document } from "mongoose";

export interface IBloodDonor extends Document {
  donorCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: "Male" | "Female" | "Other";
  age: number;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  contactNumber: string;
  email?: string;
  address?: string;
  city?: string;
  weight: number; // in kg (min 45 kg)
  hemoglobin: number; // in g/dL (min 12.5 g/dL)
  bloodPressure?: string;
  pulse?: number;
  lastDonationDate?: Date;
  donationCount: number;
  eligibilityStatus: "ELIGIBLE" | "DEFERRED_TEMPORARY" | "DEFERRED_PERMANENT";
  deferralReason?: string;
  medicalHistory?: string;
  isVoluntary: boolean;
  emergencyContact?: string;
  organizationId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const bloodDonorSchema = new Schema<IBloodDonor>(
  {
    donorCode: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    age: { type: Number, required: true, min: 18, max: 65 },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    contactNumber: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    city: { type: String, default: "New Delhi" },
    weight: { type: Number, required: true, default: 60 },
    hemoglobin: { type: Number, required: true, default: 13.5 },
    bloodPressure: { type: String, default: "120/80" },
    pulse: { type: Number, default: 72 },
    lastDonationDate: { type: Date },
    donationCount: { type: Number, default: 0 },
    eligibilityStatus: {
      type: String,
      enum: ["ELIGIBLE", "DEFERRED_TEMPORARY", "DEFERRED_PERMANENT"],
      default: "ELIGIBLE"
    },
    deferralReason: { type: String },
    medicalHistory: { type: String },
    isVoluntary: { type: Boolean, default: true },
    emergencyContact: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" }
  },
  { timestamps: true }
);

export const BloodDonor =
  mongoose.models.BloodDonor ||
  mongoose.model<IBloodDonor>("BloodDonor", bloodDonorSchema);

export default BloodDonor;
