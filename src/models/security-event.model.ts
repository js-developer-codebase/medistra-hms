import mongoose, { Schema } from "mongoose";
import { ISecurityEvent } from "@/interfaces/security-event.interface";

const securityEventSchema = new Schema<ISecurityEvent>({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    eventType: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: String }
}, { timestamps: true });

const SecurityEvent = mongoose.models.SecurityEvent || mongoose.model<ISecurityEvent>("SecurityEvent", securityEventSchema);
export default SecurityEvent;
