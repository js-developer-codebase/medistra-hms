import { Document, Types } from "mongoose";

export type AuditCategory =
  | "SYSTEM"
  | "USER_ACTIVITY"
  | "LOGIN"
  | "DATA_ACCESS"
  | "RECORD_CHANGE"
  | "SECURITY"
  | "DELETION";

export type AuditSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AuditStatus = "SUCCESS" | "FAILURE" | "WARNING" | "BLOCKED";

export interface IAuditLog extends Document {
  user?: Types.ObjectId;
  userName?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: Types.ObjectId;
  entityName?: string;
  category: AuditCategory;
  severity: AuditSeverity;
  status: AuditStatus;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  location?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  diffSummary?: string;
  patientId?: Types.ObjectId;
  complianceTags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
