import mongoose, { Schema, Document } from "mongoose";

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  status: "ACTIVE" | "EXPIRED" | "TERMINATED";
  lastActiveAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    ipAddress: { type: String, default: "127.0.0.1" },
    device: { type: String, default: "Desktop" },
    browser: { type: String, default: "Chrome" },
    os: { type: String, default: "Windows" },
    location: { type: String, default: "Kolkata, IN" },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "TERMINATED"],
      default: "ACTIVE",
    },
    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

export default mongoose.models.UserSession ||
  mongoose.model<IUserSession>("UserSession", UserSessionSchema);
