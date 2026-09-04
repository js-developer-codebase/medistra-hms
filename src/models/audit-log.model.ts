import mongoose, { Schema } from "mongoose";
import { IAuditLog } from "@/interfaces/audit-log.interface";

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    userName: { type: String },
    userRole: { type: String },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: false },
    entityName: { type: String },
    category: {
      type: String,
      enum: [
        "SYSTEM",
        "USER_ACTIVITY",
        "LOGIN",
        "DATA_ACCESS",
        "RECORD_CHANGE",
        "SECURITY",
        "DELETION",
      ],
      default: "SYSTEM",
      index: true,
    },
    severity: {
      type: String,
      enum: ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "INFO",
      index: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILURE", "WARNING", "BLOCKED"],
      default: "SUCCESS",
      index: true,
    },
    details: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    device: { type: String },
    location: { type: String },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    diffSummary: { type: String },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: false, index: true },
    complianceTags: [{ type: String }],
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });

const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;
