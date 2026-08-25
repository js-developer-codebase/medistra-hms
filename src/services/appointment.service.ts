import Appointment from "@/models/appointment.model";
import { IAppointment } from "@/interfaces/appointment.interface";

export const AppointmentService = {
    async createAppointment(data: Partial<IAppointment>) {
        return await Appointment.create(data);
    },

    async getAllAppointments() {
        return await Appointment.find()
            .populate('patientId', 'name contact')
            .populate('doctorId', 'name specialization')
            .sort({ appointmentDate: 1, appointmentTime: 1 });
    },

    async getAppointmentById(id: string) {
        return await Appointment.findById(id)
            .populate('patientId', 'name contact')
            .populate('doctorId', 'name specialization');
    },

    async updateAppointment(id: string, data: Partial<IAppointment>) {
        return await Appointment.findByIdAndUpdate(id, data, { new: true });
    },

    async deleteAppointment(id: string) {
        return await Appointment.findByIdAndDelete(id);
    }
};
