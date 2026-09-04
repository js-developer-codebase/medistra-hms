import { Document, Types } from "mongoose";

export type SecuritySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SecurityEventStatus =
  | "DETECTED"
  | "INVESTIGATING"
  | "RESOLVED"
  | "FALSE_POSITIVE"
  | "BLOCKED";

export interface ISecurityEvent extends Document {
  user?: Types.ObjectId;
  userName?: string;
  eventType: string;
  severity: SecuritySeverity;
  status: SecurityEventStatus;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  details?: string;
  resolutionNotes?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
