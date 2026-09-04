import mongoose, { Schema, model, Types } from "mongoose";
import { IAdmission } from "@/interfaces/admission.interface";

const transferHistorySchema = new Schema(
    {
        fromBedId: {
            type: Types.ObjectId,
            ref: 'Bed',
            required: true
        },
        toBedId: {
            type: Types.ObjectId,
            ref: 'Bed',
            required: true
        },
        fromDoctorId: {
            type: Types.ObjectId,
            ref: 'User'
        },
        toDoctorId: {
            type: Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            required: true
        },
        transferDate: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String
        }
    },
    { _id: true }
);

const dischargeMedicationSchema = new Schema(
    {
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String }
    },
    { _id: true }
);

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
            required: false
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
            default: "ADMITTED",
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
        reasonForAdmission: {
            type: String
        },
        initialDiagnosis: {
            type: String
        },
        emergencyContact: {
            name: String,
            phone: String,
            relation: String
        },
        insurance: {
            provider: String,
            policyNumber: String
        },
        notes: {
            type: String
        },
        // Clinical Discharge Data
        dischargeCondition: {
            type: String,
            enum: [
                "RECOVERED",
                "IMPROVED",
                "STABLE",
                "TRANSFERRED",
                "LAMA",
                "ON_REQUEST",
                "DECEASED",
                "OTHER"
            ]
        },
        finalDiagnosis: {
            type: String
        },
        dischargeSummary: {
            type: String
        },
        dischargeMedications: {
            type: [dischargeMedicationSchema],
            default: []
        },
        followUpDate: {
            type: Date
        },
        followUpInstructions: {
            type: String
        },
        dischargeAdvice: {
            type: String
        },
        // Patient Transfer History
        transferHistory: {
            type: [transferHistorySchema],
            default: []
        }
    }, { timestamps: true });

const Admission = mongoose.models.Admission || model<IAdmission>('Admission', admissionSchema);
export default Admission;