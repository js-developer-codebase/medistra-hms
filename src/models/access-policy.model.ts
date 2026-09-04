import mongoose, { Schema, Document } from "mongoose";

export interface IAccessPolicy extends Document {
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
  passwordExpiryDays: number;
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  mfaPolicy: "DISABLED" | "ADMIN_ONLY" | "ALL_USERS";
  ipWhitelist: string[];
  auditLevel: "BASIC" | "DETAILED" | "FORENSIC";
  createdAt: Date;
  updatedAt: Date;
}

const AccessPolicySchema: Schema = new Schema(
  {
    passwordMinLength: { type: Number, default: 8 },
    passwordRequireSpecial: { type: Boolean, default: true },
    passwordRequireNumbers: { type: Boolean, default: true },
    passwordRequireUppercase: { type: Boolean, default: true },
    passwordExpiryDays: { type: Number, default: 90 },
    sessionTimeoutMinutes: { type: Number, default: 30 },
    maxConcurrentSessions: { type: Number, default: 3 },
    maxFailedAttempts: { type: Number, default: 5 },
    lockoutDurationMinutes: { type: Number, default: 15 },
    mfaPolicy: {
      type: String,
      enum: ["DISABLED", "ADMIN_ONLY", "ALL_USERS"],
      default: "ADMIN_ONLY",
    },
    ipWhitelist: {
      type: [String],
      default: ["192.168.1.0/24", "10.0.0.0/16", "127.0.0.1"],
    },
    auditLevel: {
      type: String,
      enum: ["BASIC", "DETAILED", "FORENSIC"],
      default: "DETAILED",
    },
  },
  { timestamps: true }
);

export default mongoose.models.AccessPolicy ||
  mongoose.model<IAccessPolicy>("AccessPolicy", AccessPolicySchema);
