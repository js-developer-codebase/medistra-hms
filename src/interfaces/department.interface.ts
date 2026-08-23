import { Document, Types } from "mongoose";
export interface IDepartment extends Document {
    name: string,
    code: string,
    organizationId: Types.ObjectId,
    isActive: boolean
}