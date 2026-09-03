import { Schema, model, Types, models } from "mongoose";
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
            required: false
        },
        appointmentId: {
            type: Types.ObjectId,
            ref: 'Appointment',
            required: false
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
        },
        dispenseStatus: {
            type: String,
            enum: ["PENDING", "PARTIAL", "DISPENSED", "CANCELLED"],
            default: "PENDING"
        },
        dispensedAt: {
            type: Date
        },
        dispensedBy: {
            type: Types.ObjectId,
            ref: "User"
        },
        invoiceId: {
            type: Types.ObjectId,
            ref: "Invoice"
        }
    }, 
    { timestamps: true }
);

const Prescription = models.Prescription || model<IPrescription>('Prescription', prescriptionSchema);
export default Prescription;