import { Schema, model, Types } from "mongoose";
import { IPatient } from "@/interfaces/patient.interface";

const patientSchema = new Schema<IPatient>(
    {
        name: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            required: true
        },
        gender: {
            type: String,
            enum: ["MALE", "FEMALE", "OTHER"],
            required: true
        },
        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            required: true
        },
        contact: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        emergencyContact: {
            type: String,
            required: true
        },
        photo: {
            type: String
        },
        photoId: {
            type: String
        },
        branchId: {
            type: Types.ObjectId,
            ref: 'Branch',
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, { timestamps: true })

const Patient = model<IPatient>('Patient', patientSchema);
export default Patient;