import { Document, Types } from "mongoose";

export interface ISecurityEvent extends Document {
    user?: Types.ObjectId;
    eventType: string;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
    createdAt: Date;
    updatedAt: Date;
}
