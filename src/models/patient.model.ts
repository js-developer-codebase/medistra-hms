import mongoose, { Schema, model, Types } from "mongoose";
import { IPatient } from "@/interfaces/patient.interface";

const documentSubSchema = new Schema(
    {
        title: { type: String, required: true },
        category: {
            type: String,
            enum: ["LAB_REPORT", "PRESCRIPTION", "DISCHARGE_SUMMARY", "ID_PROOF", "CONSENT_FORM", "RADIOLOGY", "OTHER"],
            default: "OTHER"
        },
        fileUrl: { type: String, required: true },
        fileName: { type: String, required: true },
        fileSize: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        notes: { type: String }
    },
    { _id: true }
);

const patientSchema = new Schema<IPatient>(
    {
        uhid: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
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
            required: true,
            index: true
        },
        email: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            required: true
        },
        emergencyContact: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: Date
        },
        maritalStatus: {
            type: String,
            enum: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "OTHER"],
            default: "SINGLE"
        },
        guardianName: {
            type: String
        },
        guardianRelation: {
            type: String
        },
        allergies: {
            type: [String],
            default: []
        },
        medicalHistory: {
            type: [String],
            default: []
        },
        identificationType: {
            type: String,
            enum: ["AADHAAR", "PASSPORT", "DRIVING_LICENSE", "NATIONAL_ID", "VOTER_ID", "OTHER"],
            default: "OTHER"
        },
        identificationNumber: {
            type: String
        },
        photo: {
            type: String
        },
        photoId: {
            type: String
        },
        branchId: {
            type: Types.ObjectId,
            ref: 'Organization',
            required: true,
            index: true
        },
        documents: {
            type: [documentSubSchema],
            default: []
        },
        isMerged: {
            type: Boolean,
            default: false,
            index: true
        },
        mergedWith: {
            type: Types.ObjectId,
            ref: 'Patient'
        },
        mergeReason: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    { timestamps: true }
);

// Auto-generate UHID if not present
patientSchema.pre<IPatient>("save", function () {
    if (!this.uhid) {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        this.uhid = `MED-${year}-${randomNum}`;
    }
});


const Patient = mongoose.models.Patient || model<IPatient>('Patient', patientSchema);
export default Patient;