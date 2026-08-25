import mongoose, { Schema, Document } from "mongoose";

export interface INotificationTemplate extends Document {
  name: string;
  type: "SMS" | "EMAIL" | "PUSH" | "SYSTEM";
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ["SMS", "EMAIL", "PUSH", "SYSTEM"], required: true },
    subject: { type: String }, // For emails
    content: { type: String, required: true },
    variables: { type: [String], default: [] }, // E.g., ['patientName', 'appointmentDate']
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.NotificationTemplate ||
  mongoose.model<INotificationTemplate>("NotificationTemplate", NotificationTemplateSchema);
