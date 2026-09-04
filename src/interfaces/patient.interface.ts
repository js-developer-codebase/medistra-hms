import { Document, Types } from "mongoose";

export interface IPatientDocument {
    _id?: Types.ObjectId | string;
    title: string;
    category: string;
    fileUrl: string;
    fileName: string;
    fileSize?: string;
    uploadedAt: Date;
    notes?: string;
}

export interface IPatient extends Document {
    uhid?: string;
    name: string;
    age: number;
    gender: string;
    bloodGroup?: string;
    contact: string;
    email?: string;
    address: string;
    emergencyContact: string;
    dateOfBirth?: Date;
    maritalStatus?: string;
    guardianName?: string;
    guardianRelation?: string;
    allergies?: string[];
    medicalHistory?: string[];
    identificationType?: string;
    identificationNumber?: string;
    photo?: string;
    photoId?: string;
    branchId: Types.ObjectId;
    documents?: IPatientDocument[];
    isMerged?: boolean;
    mergedWith?: Types.ObjectId;
    mergeReason?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}