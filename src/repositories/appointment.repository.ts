import { Types } from "mongoose";
import Appointment from "@/models/appointment.model";
import { IAppointment } from "@/interfaces/appointment.interface";
import { CreateAppointmentDto, UpdateAppointmentDto } from "@/dto/appointment.dto";

export class AppointmentRepository {
    async create(data: CreateAppointmentDto): Promise<IAppointment> {
        return await new Appointment(data).save();
    }

    async findAll(): Promise<IAppointment[]> {
        return await Appointment.find().populate("patientId").populate("doctorId", "-password").populate("branchId").lean();
    }

    async findById(id: Types.ObjectId): Promise<IAppointment | null> {
        return await Appointment.findById(id).populate("patientId").populate("doctorId", "-password").populate("branchId").lean();
    }

    async findByPatientId(patientId: Types.ObjectId): Promise<IAppointment[]> {
        return await Appointment.find({ patientId }).populate("doctorId", "-password").lean();
    }

    async findByDoctorId(doctorId: Types.ObjectId): Promise<IAppointment[]> {
        return await Appointment.find({ doctorId }).populate("patientId").lean();
    }

    async findByBranchId(branchId: Types.ObjectId): Promise<IAppointment[]> {
        return await Appointment.find({ branchId }).populate("patientId").populate("doctorId", "-password").lean();
    }

    async update(id: Types.ObjectId, data: UpdateAppointmentDto): Promise<IAppointment | null> {
        return await Appointment.findByIdAndUpdate(id, data, { new: true }).populate("patientId").populate("doctorId", "-password").populate("branchId").lean();
    }

    async delete(id: Types.ObjectId): Promise<IAppointment | null> {
        return await Appointment.findByIdAndDelete(id).lean();
    }
}

export default new AppointmentRepository();
