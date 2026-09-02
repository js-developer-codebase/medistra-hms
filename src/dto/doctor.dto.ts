import { Types } from "mongoose";

export interface CreateDoctorDto {
    userId: Types.ObjectId | string;
    departmentId: Types.ObjectId | string;
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

export interface UpdateDoctorDto {
    userId?: Types.ObjectId | string;
    departmentId?: Types.ObjectId | string;
    licenseNo?: string;
    specialization?: string;
    qualification?: string;
    experienceYears?: number;
    consultationFee?: number;
    roomNumber?: string;
    bio?: string;
    phone?: string;
    status?: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
}
