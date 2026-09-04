import mongoose, { Schema, Document } from "mongoose";

export interface INotificationSetting extends Document {
  smsProvider: "FAST2SMS" | "MSG91" | "TWILIO" | "CUSTOM";
  smsApiKey?: string;
  smsSenderId?: string;
  smsDltEntityId?: string;
  smsCostPerCredit: number; // In INR (₹)
  smsBalanceCredits: number;
  emailProvider: "SMTP" | "SENDGRID" | "AWS_SES";
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  emailFromName?: string;
  emailFromAddress?: string;
  systemAlertSound: boolean;
  autoRetryFailed: boolean;
  maxRetryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSettingSchema: Schema = new Schema(
  {
    smsProvider: {
      type: String,
      enum: ["FAST2SMS", "MSG91", "TWILIO", "CUSTOM"],
      default: "FAST2SMS",
    },
    smsApiKey: { type: String, default: "" },
    smsSenderId: { type: String, default: "MEDSTR" },
    smsDltEntityId: { type: String, default: "1101234567890" },
    smsCostPerCredit: { type: Number, default: 0.2 }, // ₹0.20 per SMS
    smsBalanceCredits: { type: Number, default: 5000 },
    emailProvider: {
      type: String,
      enum: ["SMTP", "SENDGRID", "AWS_SES"],
      default: "SMTP",
    },
    smtpHost: { type: String, default: "smtp.medistra.in" },
    smtpPort: { type: Number, default: 587 },
    smtpSecure: { type: Boolean, default: false },
    smtpUser: { type: String, default: "alerts@medistra.in" },
    smtpPass: { type: String, default: "" },
    emailFromName: { type: String, default: "Medistra Super Speciality Hospital" },
    emailFromAddress: { type: String, default: "noreply@medistra.in" },
    systemAlertSound: { type: Boolean, default: true },
    autoRetryFailed: { type: Boolean, default: true },
    maxRetryCount: { type: Number, default: 3 },
  },
  { timestamps: true }
);

export default mongoose.models.NotificationSetting ||
  mongoose.model<INotificationSetting>("NotificationSetting", NotificationSettingSchema);
