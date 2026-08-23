import { Document, Types } from "mongoose";

export interface IPatient extends Document {
    name: string,
    age: number,
    gender: string,
    bloodGroup?: string,
    contact: string,
    address: string,
    emergencyContact: string,
    photo?: string,
    photoId?: string,
    branchId: Types.ObjectId,
    isActive: boolean
}