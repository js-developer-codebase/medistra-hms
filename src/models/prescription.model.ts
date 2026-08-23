import { Schema, model, Types } from "mongoose";
import { IPrescription } from "@/interfaces/prescription.interface";

const prescriptionSchema = new Schema<IPrescription>(
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
        appointmentId: {
            type: Types.ObjectId,
            ref: 'Appointment',
            required: true
        },
        visitDate: {
            type: Date,
            required: true
        },
        symptoms: {
            type: String
        },
        diagnosis: {
            type: String
        },
        medications: [
            {
                name: {
                    type: String,
                    required: true
                },
                dosage: {
                    type: String
                },
                frequency: {
                    type: String
                },
                duration: {
                    type: String
                },
                instructions: {
                    type: String
                }
            }
        ],
        followUpDate: {
            type: Date
        },
        notes: {
            type: String
        }
    }, { timestamps: true })

const Prescription = model<IPrescription>('Prescription', prescriptionSchema);
export default Prescription;