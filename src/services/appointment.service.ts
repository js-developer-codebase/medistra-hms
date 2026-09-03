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
    }
};
