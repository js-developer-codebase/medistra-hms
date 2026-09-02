import Appointment from "@/models/appointment.model";
import Patient from "@/models/patient.model";
import Doctor from "@/models/doctor.model";
import User from "@/models/user.model";
import Department from "@/models/department.model";
import Organization from "@/models/organization.model";
import { IAppointment } from "@/interfaces/appointment.interface";
import { Types } from "mongoose";

export const AppointmentService = {
    async createAppointment(data: any) {
        // Register dependent models
        if (!Patient) {}
        if (!Doctor) {}
        if (!User) {}
        if (!Department) {}

        // Resolve branchId if not provided
        if (!data.branchId || !Types.ObjectId.isValid(data.branchId)) {
            const org = await Organization.findOne();
            if (org) {
                data.branchId = org._id;
            }
        }

        // Auto-generate daily token number for doctor
        if (!data.tokenNumber && data.doctorId) {
            const apptDate = data.appointmentDate ? new Date(data.appointmentDate) : new Date();
            apptDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(apptDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const count = await Appointment.countDocuments({
                doctorId: data.doctorId,
                appointmentDate: { $gte: apptDate, $lt: nextDay }
            });
            data.tokenNumber = `T-${String(count + 1).padStart(2, '0')}`;
        }

        const appointment = await Appointment.create(data);
        return await this.getAppointmentById(appointment._id.toString());
    },

    async getAllAppointments(filter: any = {}) {
        if (!Patient) {}
        if (!Doctor) {}
        if (!User) {}
        if (!Department) {}

        // Check if we should seed sample appointments
        await this.ensureSampleAppointments();

        const query: any = {};
        if (filter.status && filter.status !== 'ALL') query.status = filter.status;
        if (filter.type && filter.type !== 'ALL') query.type = filter.type;
        if (filter.doctorId && Types.ObjectId.isValid(filter.doctorId)) query.doctorId = filter.doctorId;

        if (filter.date) {
            const start = new Date(filter.date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            query.appointmentDate = { $gte: start, $lt: end };
        }

        return await Appointment.find(query)
            .populate('patientId', 'name contact uhid age gender bloodGroup')
            .populate({
                path: 'doctorId',
                populate: [
                    { path: 'userId', select: 'name email phone avatar' },
                    { path: 'departmentId', select: 'name code location' }
                ]
            })
            .sort({ appointmentDate: 1, appointmentTime: 1 })
            .lean();
    },

    async getAppointmentById(id: string) {
        if (!Patient) {}
        if (!Doctor) {}
        if (!User) {}
        if (!Department) {}

        return await Appointment.findById(id)
            .populate('patientId', 'name contact uhid age gender bloodGroup')
            .populate({
                path: 'doctorId',
                populate: [
                    { path: 'userId', select: 'name email phone avatar' },
                    { path: 'departmentId', select: 'name code location' }
                ]
            })
            .lean();
    },

    async updateAppointment(id: string, data: Partial<IAppointment>) {
        return await Appointment.findByIdAndUpdate(id, data, { new: true })
            .populate('patientId', 'name contact uhid age gender bloodGroup')
            .populate({
                path: 'doctorId',
                populate: [
                    { path: 'userId', select: 'name email phone avatar' },
                    { path: 'departmentId', select: 'name code location' }
                ]
            })
            .lean();
    },

    async deleteAppointment(id: string) {
        return await Appointment.findByIdAndDelete(id);
    },

    async ensureSampleAppointments() {
        const count = await Appointment.countDocuments();
        if (count > 0) return;

        let patients = await Patient.find().limit(5);
        if (patients.length === 0) {
            // Create a default patient
            let org = await Organization.findOne();
            const p1 = await Patient.create({
                name: "Rahul Verma",
                age: 34,
                gender: "MALE",
                bloodGroup: "B+",
                contact: "+91 9876543210",
                email: "rahul.verma@example.com",
                address: "Flat 4B, Green Park, South Extension",
                emergencyContact: "+91 9876543211",
                branchId: org?._id || new Types.ObjectId("000000000000000000000000")
            });
            const p2 = await Patient.create({
                name: "Ananya Sharma",
                age: 28,
                gender: "FEMALE",
                bloodGroup: "O+",
                contact: "+91 9812345678",
                email: "ananya.s@example.com",
                address: "Apt 12, Sunrise Residency",
                emergencyContact: "+91 9812345679",
                branchId: org?._id || new Types.ObjectId("000000000000000000000000")
            });
            const p3 = await Patient.create({
                name: "Vikram Malhotra",
                age: 52,
                gender: "MALE",
                bloodGroup: "A+",
                contact: "+91 9834567890",
                email: "vikram.m@example.com",
                address: "Villa 9, Palm Meadows",
                emergencyContact: "+91 9834567891",
                branchId: org?._id || new Types.ObjectId("000000000000000000000000")
            });
            patients = [p1, p2, p3];
        }

        const doctors = await Doctor.find().limit(4);
        if (doctors.length === 0) return;

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const sampleData = [
            {
                patientId: patients[0]._id,
                doctorId: doctors[0]._id,
                appointmentDate: today,
                appointmentTime: "09:30",
                tokenNumber: "T-01",
                status: "IN_PROGRESS",
                queueStatus: "IN_CONSULTATION",
                priority: "URGENT",
                type: "NEW",
                reason: "Acute Chest Pain & Palpitations",
                consultationFee: 750,
                paymentStatus: "PAID",
                paymentMode: "UPI",
                checkedInAt: today,
                consultationStartedAt: today
            },
            {
                patientId: patients[1]._id,
                doctorId: doctors[0]._id,
                appointmentDate: today,
                appointmentTime: "10:00",
                tokenNumber: "T-02",
                status: "CHECKED_IN",
                queueStatus: "WAITING",
                priority: "NORMAL",
                type: "FOLLOW_UP",
                reason: "Hypertension Routine Monitoring",
                consultationFee: 500,
                paymentStatus: "PAID",
                paymentMode: "CARD",
                checkedInAt: today
            },
            {
                patientId: patients[patients.length - 1]._id,
                doctorId: doctors[doctors.length - 1]._id,
                appointmentDate: today,
                appointmentTime: "11:15",
                tokenNumber: "T-03",
                status: "SCHEDULED",
                queueStatus: "WAITING",
                priority: "NORMAL",
                type: "ROUTINE_CHECKUP",
                reason: "Annual Health Evaluation",
                consultationFee: 600,
                paymentStatus: "PENDING",
                paymentMode: "PAY_AT_CLINIC"
            },
            {
                patientId: patients[0]._id,
                doctorId: doctors[0]._id,
                appointmentDate: today,
                appointmentTime: "08:45",
                tokenNumber: "T-00",
                status: "COMPLETED",
                queueStatus: "COMPLETED",
                priority: "NORMAL",
                type: "FOLLOW_UP",
                reason: "Blood Test Review & ECG Check",
                consultationFee: 500,
                paymentStatus: "PAID",
                paymentMode: "CASH",
                checkedInAt: today,
                consultationStartedAt: today,
                consultationEndedAt: today
            },
            {
                patientId: patients[1]._id,
                doctorId: doctors[0]._id,
                appointmentDate: yesterday,
                appointmentTime: "14:00",
                tokenNumber: "T-05",
                status: "NO_SHOW",
                queueStatus: "SKIPPED",
                priority: "NORMAL",
                type: "NEW",
                reason: "Joint Pain Consultation",
                consultationFee: 500,
                paymentStatus: "PENDING",
                noShowRecordedAt: yesterday
            },
            {
                patientId: patients[patients.length - 1]._id,
                doctorId: doctors[0]._id,
                appointmentDate: tomorrow,
                appointmentTime: "10:30",
                tokenNumber: "T-01",
                status: "SCHEDULED",
                queueStatus: "WAITING",
                priority: "VIP",
                type: "NEW",
                reason: "Neurology Second Opinion",
                consultationFee: 1000,
                paymentStatus: "PAID",
                paymentMode: "CARD"
            },
            {
                patientId: patients[0]._id,
                doctorId: doctors[0]._id,
                appointmentDate: today,
                appointmentTime: "15:00",
                tokenNumber: "T-06",
                status: "CANCELLED",
                queueStatus: "SKIPPED",
                priority: "NORMAL",
                type: "NEW",
                reason: "Severe migraine and dizziness",
                cancellationReason: "Patient called to reschedule due to emergency travel",
                cancellationCategory: "Patient Request",
                cancelledAt: today
            }
        ];

        try {
            await Appointment.insertMany(sampleData);
        } catch (e) {
            console.error("Failed to seed sample appointments:", e);
        }
    }
};

