import mongoose, { Schema } from "mongoose";
import { IAuditLog } from "@/interfaces/audit-log.interface";

const auditLogSchema = new Schema<IAuditLog>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    details: { type: String, required: true },
    ipAddress: { type: String }
}, { timestamps: true });

const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
export default AuditLog;
