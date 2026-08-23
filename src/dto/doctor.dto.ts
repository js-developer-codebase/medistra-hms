import { Types } from "mongoose";

export interface CreateDoctorDto {
    userId: Types.ObjectId | string;
    departmentId: Types.ObjectId | string;
    licenseNo: string;
}

export interface UpdateDoctorDto {
    userId?: Types.ObjectId | string;
    departmentId?: Types.ObjectId | string;
    licenseNo?: string;
}
