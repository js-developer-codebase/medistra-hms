import { Document, Types } from "mongoose";

export interface IAlert extends Document {
  source: "Clinical" | "Inventory" | "Operations";
  message: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  status: "ACTIVE" | "ACKNOWLEDGED";
  branchId?: Types.ObjectId;
}
