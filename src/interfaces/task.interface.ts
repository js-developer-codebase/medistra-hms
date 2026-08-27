import { Document, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  assignedTo: Types.ObjectId;
  assignedBy: Types.ObjectId;
  patientId?: Types.ObjectId;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate: Date;
  department?: string;
}
