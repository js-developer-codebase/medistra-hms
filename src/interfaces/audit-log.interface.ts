import { Document, Types } from "mongoose";

export interface IAuditLog extends Document {
    user: Types.ObjectId;
    action: string;
    entity: string;
    entityId?: Types.ObjectId;
    details: string;
    ipAddress?: string;
    createdAt: Date;
    updatedAt: Date;
}
