import { Types } from "mongoose";

export interface CreatePatientDto {
    uhid?: string;
    name: string;
    age: number;
    gender: string;
    bloodGroup?: string;
    contact: string;
    email?: string;
    address: string;
    emergencyContact: string;
    dateOfBirth?: Date | string;
    maritalStatus?: string;
    guardianName?: string;
    guardianRelation?: string;
    allergies?: string[];
    medicalHistory?: string[];
    identificationType?: string;
    identificationNumber?: string;
    photo?: string;
    photoId?: string;
    branchId: Types.ObjectId | string;
    isActive?: boolean;
}

export interface UpdatePatientDto {
    uhid?: string;
    name?: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    contact?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    dateOfBirth?: Date | string;
    maritalStatus?: string;
    guardianName?: string;
    guardianRelation?: string;
    allergies?: string[];
    medicalHistory?: string[];
    identificationType?: string;
    identificationNumber?: string;
    photo?: string;
    photoId?: string;
    branchId?: Types.ObjectId | string;
    isActive?: boolean;
    isMerged?: boolean;
    mergedWith?: Types.ObjectId | string;
    mergeReason?: string;
}

export interface AddPatientDocumentDto {
    title: string;
    category: "LAB_REPORT" | "PRESCRIPTION" | "DISCHARGE_SUMMARY" | "ID_PROOF" | "CONSENT_FORM" | "RADIOLOGY" | "OTHER";
    fileUrl: string;
    fileName: string;
    fileSize?: string;
    notes?: string;
}

export interface MergePatientDto {
    primaryPatientId: string;
    secondaryPatientId: string;
    reason: string;
}

