import { Document, Types } from "mongoose";
export interface IDepartment extends Document {
    name: string,
    code: string,
    branchId: Types.ObjectId,
    isActive: boolean
}