import { Document, Types } from "mongoose";

export interface IAppointment extends Document {
    patientId: Types.ObjectId,
    doctorId: Types.ObjectId,
    branchId: Types.ObjectId,
    appointmentDate: Date,
    appointmentTime: string,
    status: string,
    type: string,
    reason: string,
    notes?: string,
}