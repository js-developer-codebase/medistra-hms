import { Types } from "mongoose";

export interface CreateAdmissionDto {
    patientId: Types.ObjectId | string;
    doctorId: Types.ObjectId | string;
    branchId: Types.ObjectId | string;
    bedId: Types.ObjectId | string;
    admissionDate: Date | string;
    dischargeDate?: Date | string;
    status: string;
    admissionType?: string;
    notes?: string;
}

export interface UpdateAdmissionDto {
    patientId?: Types.ObjectId | string;
    doctorId?: Types.ObjectId | string;
    branchId?: Types.ObjectId | string;
    bedId?: Types.ObjectId | string;
    admissionDate?: Date | string;
    dischargeDate?: Date | string;
    status?: string;
    admissionType?: string;
    notes?: string;
}
