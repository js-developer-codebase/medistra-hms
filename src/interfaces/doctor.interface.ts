import { Document, Types } from "mongoose";

export interface IDoctor extends Document {
    userId: Types.ObjectId;
    departmentId: Types.ObjectId;
    licenseNo: string;
    specialization?: string;
    qualification?: string;
    experienceYears?: number;
    consultationFee?: number;
    roomNumber?: string;
    bio?: string;
    phone?: string;
    status?: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
}