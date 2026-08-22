import { Schema, model, Types } from "mongoose";
import { IDepartment } from "@/interfaces/department.interface";

const departmentSchema = new Schema<IDepartment>(
    {
        name: {
            type: String,
            enum: [
                "CARDIOLOGY",
                "NEUROLOGY",
                "ORTHOPEDICS",
                "PEDIATRICS",
                "GYNECOLOGY",
                "DERMATOLOGY",
                "OPHTHALMOLOGY",
                "OTORHINOLARYNGOLOGY",
                "UROLOGY",
                "GASTROENTEROLOGY",
                "ENDOCRINOLOGY",
                "NEPHROLOGY",
                "RHEUMATOLOGY",
                "ONCOLOGY",
                "HEMATOLOGY",
                "PULMONOLOGY",
                "CARDIOTHORACIC",
                "VASCULAR",
                "TRANSPLANTATION",
                "EMERGENCY",
                "INTERNAL_MEDICINE",
                "OTHER"
            ],
            default: 'OTHER',
            trim: true
        },
        code: {
            type: String,
            required: true,
            trim: true
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

const Department = model<IDepartment>('Department', departmentSchema);
export default Department;