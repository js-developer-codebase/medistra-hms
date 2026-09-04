import mongoose, { Schema, Types } from "mongoose";
import { IDepartment } from "@/interfaces/department.interface";

const departmentSchema = new Schema<IDepartment>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            trim: true
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization'
        },
        headOfDepartment: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        location: {
            type: String,
            trim: true
        },
        phoneExtension: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, { timestamps: true });

const Department = mongoose.models.Department || mongoose.model<IDepartment>('Department', departmentSchema);
export default Department;