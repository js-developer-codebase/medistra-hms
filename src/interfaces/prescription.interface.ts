import { Document, Types } from 'mongoose';

export interface IPrescription extends Document {
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    branchId?: Types.ObjectId;
    appointmentId?: Types.ObjectId;
    visitDate: Date;
    symptoms?: string;
    diagnosis?: string;
    medications: IMedication[];
    followUpDate?: Date;
    notes?: string;
    dispenseStatus?: "PENDING" | "PARTIAL" | "DISPENSED" | "CANCELLED";
    dispensedAt?: Date;
    dispensedBy?: Types.ObjectId;
    invoiceId?: Types.ObjectId;
}

export interface IMedication {
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
}