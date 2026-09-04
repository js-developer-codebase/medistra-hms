import { Document, Types } from "mongoose";

export interface ITransferRecord {
    _id?: Types.ObjectId | string;
    fromBedId: Types.ObjectId | any;
    toBedId: Types.ObjectId | any;
    fromDoctorId?: Types.ObjectId | any;
    toDoctorId?: Types.ObjectId | any;
    reason: string;
    transferDate: Date;
    notes?: string;
}

export interface IDischargeMedication {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

export interface IAdmission extends Document {
    patientId: Types.ObjectId | any;
    doctorId: Types.ObjectId | any;
    branchId?: Types.ObjectId | any;
    bedId: Types.ObjectId | any;
    admissionDate: Date;
    dischargeDate?: Date;
    status: "ADMITTED" | "TRANSFERRED" | "DISCHARGED" | "CANCELLED" | string;
    admissionType: "EMERGENCY" | "ELECTIVE" | "TRANSFER" | "DAYCARE" | string;
    reasonForAdmission?: string;
    initialDiagnosis?: string;
    emergencyContact?: {
        name?: string;
        phone?: string;
        relation?: string;
    };
    insurance?: {
        provider?: string;
        policyNumber?: string;
    };
    notes?: string;
    // Discharge information
    dischargeCondition?: "RECOVERED" | "IMPROVED" | "STABLE" | "TRANSFERRED" | "LAMA" | "ON_REQUEST" | "DECEASED" | "OTHER" | string;
    finalDiagnosis?: string;
    dischargeSummary?: string;
    dischargeMedications?: IDischargeMedication[];
    followUpDate?: Date;
    followUpInstructions?: string;
    dischargeAdvice?: string;
    // Transfer records
    transferHistory?: ITransferRecord[];
    createdAt?: Date;
    updatedAt?: Date;
}