import mongoose, { Schema, Document } from "mongoose";

export interface INotificationLog extends Document {
  recipient: mongoose.Types.ObjectId;
  recipientModel: "User" | "Patient" | "Doctor" | "Staff";
  templateId?: mongoose.Types.ObjectId;
  type: "SMS" | "EMAIL" | "PUSH" | "SYSTEM";
  subject?: string;
  content: string;
  status: "PENDING" | "SENT" | "FAILED";
  error?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationLogSchema: Schema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, required: true, refPath: "recipientModel" },
    recipientModel: { type: String, required: true, enum: ["User", "Patient", "Doctor", "Staff"] },
    templateId: { type: Schema.Types.ObjectId, ref: "NotificationTemplate" },
    type: { type: String, enum: ["SMS", "EMAIL", "PUSH", "SYSTEM"], required: true },
    subject: { type: String },
    content: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "SENT", "FAILED"], default: "PENDING" },
    error: { type: String },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.NotificationLog ||
  mongoose.model<INotificationLog>("NotificationLog", NotificationLogSchema);
