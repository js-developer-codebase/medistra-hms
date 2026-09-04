import mongoose, { Schema, Document } from "mongoose";

export interface INotificationTemplate extends Document {
  name: string;
  type: "SMS" | "EMAIL" | "PUSH" | "SYSTEM";
  category: "APPOINTMENT" | "BILLING" | "ADMISSION" | "LAB_RESULT" | "EMERGENCY" | "GENERAL" | "PHARMACY";
  subject?: string;
  content: string;
  variables: string[];
  dltTemplateId?: string; // Indian TRAI/DLT compliance ID for SMS
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ["SMS", "EMAIL", "PUSH", "SYSTEM"], required: true },
    category: {
      type: String,
      enum: ["APPOINTMENT", "BILLING", "ADMISSION", "LAB_RESULT", "EMERGENCY", "GENERAL", "PHARMACY"],
      default: "GENERAL",
    },
    subject: { type: String }, // For emails
    content: { type: String, required: true },
    variables: { type: [String], default: [] }, // E.g., ['patientName', 'appointmentDate']
    dltTemplateId: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.NotificationTemplate ||
  mongoose.model<INotificationTemplate>("NotificationTemplate", NotificationTemplateSchema);

