import { Types } from "mongoose";

export interface MedicationDto {
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
}

export interface CreatePrescriptionDto {
    patientId: Types.ObjectId | string;
    doctorId: Types.ObjectId | string;
    branchId?: Types.ObjectId | string;
    appointmentId?: Types.ObjectId | string;
    visitDate: Date | string;
    symptoms?: string;
    diagnosis?: string;
    medications: MedicationDto[];
    followUpDate?: Date | string;
    notes?: string;
}

export interface UpdatePrescriptionDto {
    patientId?: Types.ObjectId | string;
    doctorId?: Types.ObjectId | string;
    branchId?: Types.ObjectId | string;
    appointmentId?: Types.ObjectId | string;
    visitDate?: Date | string;
    symptoms?: string;
    diagnosis?: string;
    medications?: MedicationDto[];
    followUpDate?: Date | string;
    notes?: string;
}
