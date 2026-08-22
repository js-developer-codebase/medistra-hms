import { Document, Types } from "mongoose";

export interface IAdmission extends Document {
    patientId: Types.ObjectId,
    doctorId: Types.ObjectId,
    branchId: Types.ObjectId,
    bedId: Types.ObjectId,
    admissionDate: Date,
    dischargeDate?: Date,
    status: string,
    admissionType: string,
    notes?: string,
}