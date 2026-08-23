import { Schema, model, Types } from "mongoose";
import { IAdmission } from "@/interfaces/admission.interface";

const admissionSchema = new Schema<IAdmission>(
    {
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true
        },
        doctorId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true
        },
        branchId: {
            type: Types.ObjectId,
            ref: 'Branch',
            required: true
        },
        bedId: {
            type: Types.ObjectId,
            ref: 'Bed',
            required: true
        },
        admissionDate: {
            type: Date,
            required: true
        },
        dischargeDate: {
            type: Date
        },
        status: {
            type: String,
            enum: [
                "ADMITTED",
                "TRANSFERRED",
                "DISCHARGED",
                "CANCELLED",
            ],
            required: true
        },
        admissionType: {
            type: String,
            enum: [
                "EMERGENCY",
                "ELECTIVE",
                "TRANSFER",
                "DAYCARE",
            ],
            default: 'ELECTIVE'
        },
        notes: {
            type: String
        }
    }, { timestamps: true });

const Admission = model<IAdmission>('Admission', admissionSchema);
export default Admission;