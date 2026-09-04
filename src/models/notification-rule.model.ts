import mongoose, { Schema, Document } from "mongoose";

export interface INotificationRule extends Document {
  name: string;
  triggerEvent:
    | "APPOINTMENT_BOOKED"
    | "APPOINTMENT_CANCELLED"
    | "INVOICE_GENERATED"
    | "LAB_REPORT_READY"
    | "PATIENT_ADMITTED"
    | "PATIENT_DISCHARGED"
    | "EMERGENCY_ALERT";
  channels: ("SMS" | "EMAIL" | "PUSH" | "SYSTEM")[];
  recipientRoles: ("PATIENT" | "DOCTOR" | "STAFF" | "ADMIN")[];
  templateId?: mongoose.Types.ObjectId;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationRuleSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    triggerEvent: {
      type: String,
      enum: [
        "APPOINTMENT_BOOKED",
        "APPOINTMENT_CANCELLED",
        "INVOICE_GENERATED",
        "LAB_REPORT_READY",
        "PATIENT_ADMITTED",
        "PATIENT_DISCHARGED",
        "EMERGENCY_ALERT",
      ],
      required: true,
    },
    channels: {
      type: [{ type: String, enum: ["SMS", "EMAIL", "PUSH", "SYSTEM"] }],
      default: ["SYSTEM"],
    },
    recipientRoles: {
      type: [{ type: String, enum: ["PATIENT", "DOCTOR", "STAFF", "ADMIN"] }],
      default: ["PATIENT"],
    },
    templateId: { type: Schema.Types.ObjectId, ref: "NotificationTemplate" },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.NotificationRule ||
  mongoose.model<INotificationRule>("NotificationRule", NotificationRuleSchema);
