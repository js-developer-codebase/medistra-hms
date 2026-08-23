import { Schema, model, Types } from "mongoose";
import { IDoctor } from "@/interfaces/doctor.interface";

const doctorSchema = new Schema<IDoctor>(
    {
        userId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true
        },
        departmentId: {
            type: Types.ObjectId,
            ref: 'Department',
            required: true
        },
        licenseNo: {
            type: String,
            required: true
        },
    }, { timestamps: true })

const Doctor = model<IDoctor>('Doctor', doctorSchema);
export default Doctor;