import { Types } from "mongoose";

export interface CreateAppointmentDto {
    patientId: Types.ObjectId | string;
    doctorId: Types.ObjectId | string;
    branchId: Types.ObjectId | string;
    appointmentDate: Date | string;
    appointmentTime: string;
    status?: string;
    type?: string;
    reason: string;
    notes?: string;
}

export interface UpdateAppointmentDto {
    patientId?: Types.ObjectId | string;
    doctorId?: Types.ObjectId | string;
    branchId?: Types.ObjectId | string;
    appointmentDate?: Date | string;
    appointmentTime?: string;
    status?: string;
    type?: string;
    reason?: string;
    notes?: string;
}
