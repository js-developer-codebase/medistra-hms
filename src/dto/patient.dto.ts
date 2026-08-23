import { Types } from "mongoose";

export interface CreatePatientDto {
    name: string;
    age: number;
    gender: string;
    bloodGroup?: string;
    contact: string;
    address: string;
    emergencyContact: string;
    photo?: string;
    photoId?: string;
    branchId: Types.ObjectId | string;
    isActive?: boolean;
}

export interface UpdatePatientDto {
    name?: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    contact?: string;
    address?: string;
    emergencyContact?: string;
    photo?: string;
    photoId?: string;
    branchId?: Types.ObjectId | string;
    isActive?: boolean;
}
