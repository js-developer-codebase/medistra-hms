import mongoose, { Schema, Types } from "mongoose";
import { IDoctor } from "@/interfaces/doctor.interface";

const doctorSchema = new Schema<IDoctor>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        licenseNo: {
            type: String,
            required: true
        },
        specialization: {
            type: String,
            trim: true
        },
        qualification: {
            type: String,
            trim: true
        },
        experienceYears: {
            type: Number,
            default: 0
        },
        consultationFee: {
            type: Number,
            default: 0
        },
        roomNumber: {
            type: String,
            trim: true
        },
        bio: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "ON_LEAVE"],
            default: "ACTIVE"
        }
    }, { timestamps: true });

const Doctor = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', doctorSchema);
export default Doctor;