import mongoose, { Schema } from "mongoose";
import { ISecurityEvent } from "@/interfaces/security-event.interface";

const securityEventSchema = new Schema<ISecurityEvent>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    userName: { type: String },
    eventType: { type: String, required: true, index: true },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
      index: true,
    },
    status: {
      type: String,
      enum: ["DETECTED", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE", "BLOCKED"],
      default: "DETECTED",
      index: true,
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    location: { type: String },
    details: { type: String },
    resolutionNotes: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

securityEventSchema.index({ createdAt: -1 });
securityEventSchema.index({ severity: 1, status: 1 });

const SecurityEvent =
  mongoose.models.SecurityEvent ||
  mongoose.model<ISecurityEvent>("SecurityEvent", securityEventSchema);

export default SecurityEvent;
