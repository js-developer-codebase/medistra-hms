import appointmentRepository, { AppointmentRepository } from "@/repositories/appointment.repository";
import { Types } from "mongoose";
import { IAppointment } from "@/interfaces/appointment.interface";
import { CreateAppointmentDto, UpdateAppointmentDto } from "@/dto/appointment.dto";

export class AppointmentService {
    constructor(private repository: AppointmentRepository = appointmentRepository) { }

    async createAppointment(data: CreateAppointmentDto): Promise<IAppointment> {
        return await this.repository.create(data);
    }

    async getAllAppointments(): Promise<IAppointment[]> {
        return await this.repository.findAll();
    }

    async getAppointmentById(id: Types.ObjectId): Promise<IAppointment | null> {
        return await this.repository.findById(id);
    }

    async getAppointmentsByPatientId(patientId: Types.ObjectId): Promise<IAppointment[]> {
        return await this.repository.findByPatientId(patientId);
    }

    async getAppointmentsByDoctorId(doctorId: Types.ObjectId): Promise<IAppointment[]> {
        return await this.repository.findByDoctorId(doctorId);
    }

    async getAppointmentsByBranchId(branchId: Types.ObjectId): Promise<IAppointment[]> {
        return await this.repository.findByBranchId(branchId);
    }

    async updateAppointment(id: Types.ObjectId, data: UpdateAppointmentDto): Promise<IAppointment | null> {
        const appointment = await this.repository.findById(id);
        if (!appointment) {
            throw { statusCode: 404, message: "Appointment not found" };
        }
        return await this.repository.update(id, data);
    }

    async deleteAppointment(id: Types.ObjectId): Promise<IAppointment | null> {
        const appointment = await this.repository.findById(id);
        if (!appointment) {
            throw { statusCode: 404, message: "Appointment not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new AppointmentService();
