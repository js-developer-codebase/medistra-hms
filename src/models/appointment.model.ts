import { model, models, Schema, Types } from "mongoose";
import { IAppointment } from "@/interfaces/appointment.interface";

const appointmentSchema = new Schema<IAppointment>(
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
        appointmentDate: {
            type: Date,
            required: true
        },
        appointmentTime: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: [
                "SCHEDULED",
                "CONFIRMED",
                "CHECKED_IN",
                "IN_PROGRESS",
                "COMPLETED",
                "CANCELLED",
                "NO_SHOW",
            ],
            default: "SCHEDULED",
        },
        type: {
            type: String,
            enum: [
                "NEW",
                "FOLLOW_UP",
                "EMERGENCY",
            ],
            default: "NEW",
        },
        reason: {
            type: String,
            required: true
        },
        notes: {
            type: String
        }
    }, { timestamps: true });

const Appointment = models.Appointment || model<IAppointment>('Appointment', appointmentSchema);
export default Appointment;