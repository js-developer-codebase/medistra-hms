import { Types } from "mongoose";

export interface CreateAlertDto {
  source: "Clinical" | "Inventory" | "Operations";
  message: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  status?: "ACTIVE" | "ACKNOWLEDGED";
  branchId?: string | Types.ObjectId;
}

export interface UpdateAlertDto {
  status?: "ACTIVE" | "ACKNOWLEDGED";
}
