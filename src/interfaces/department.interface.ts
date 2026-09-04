import { Document, Types } from "mongoose";
export interface IDepartment extends Document {
    name: string;
    code: string;
    organizationId?: Types.ObjectId;
    headOfDepartment?: Types.ObjectId;
    location?: string;
    phoneExtension?: string;
    description?: string;
    isActive: boolean;
}