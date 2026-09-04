import mongoose, { Schema, Document } from "mongoose";

export interface INotificationLog extends Document {
  recipient?: mongoose.Types.ObjectId;
  recipientModel?: "User" | "Patient" | "Doctor" | "Staff";
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  templateId?: mongoose.Types.ObjectId;
  type: "SMS" | "EMAIL" | "PUSH" | "SYSTEM";
  subject?: string;
  content: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED";
  cost?: number; // Cost in INR (₹)
  error?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationLogSchema: Schema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, refPath: "recipientModel" },
    recipientModel: { type: String, enum: ["User", "Patient", "Doctor", "Staff"] },
    recipientName: { type: String },
    recipientPhone: { type: String },
    recipientEmail: { type: String },
    templateId: { type: Schema.Types.ObjectId, ref: "NotificationTemplate" },
    type: { type: String, enum: ["SMS", "EMAIL", "PUSH", "SYSTEM"], required: true },
    subject: { type: String },
    content: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "SENT", "DELIVERED", "FAILED"], default: "PENDING" },
    cost: { type: Number, default: 0 },
    error: { type: String },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.NotificationLog ||
  mongoose.model<INotificationLog>("NotificationLog", NotificationLogSchema);

