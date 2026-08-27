import { Types } from "mongoose";

export interface CreateTaskDto {
  title: string;
  description?: string;
  assignedTo: string | Types.ObjectId;
  assignedBy: string | Types.ObjectId;
  patientId?: string | Types.ObjectId;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate: string | Date;
  department?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  assignedTo?: string | Types.ObjectId;
  assignedBy?: string | Types.ObjectId;
  patientId?: string | Types.ObjectId;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate?: string | Date;
  department?: string;
}
