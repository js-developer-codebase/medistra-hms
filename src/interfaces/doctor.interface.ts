import { Document, Types } from "mongoose";

export interface IDoctor extends Document {
    userId: Types.ObjectId,
    departmentId: Types.ObjectId,
    licenseNo: string;
}