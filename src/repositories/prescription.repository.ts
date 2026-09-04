import { Types } from "mongoose";
import Prescription from "@/models/prescription.model";
import "@/models/patient.model";
import "@/models/user.model";
import "@/models/organization.model";
import "@/models/appointment.model";
import { IPrescription } from "@/interfaces/prescription.interface";
import { CreatePrescriptionDto, UpdatePrescriptionDto } from "@/dto/prescription.dto";

export class PrescriptionRepository {
    async create(data: CreatePrescriptionDto): Promise<IPrescription> {
        return await new Prescription(data).save();
    }

    async findAll(): Promise<IPrescription[]> {
        return await Prescription.find().populate("patientId").populate("doctorId", "-password").populate("branchId").populate("appointmentId").lean();
    }

    async findById(id: Types.ObjectId): Promise<IPrescription | null> {
        return await Prescription.findById(id).populate("patientId").populate("doctorId", "-password").populate("branchId").populate("appointmentId").lean();
    }

    async findByPatientId(patientId: Types.ObjectId): Promise<IPrescription[]> {
        return await Prescription.find({ patientId }).populate("doctorId", "-password").populate("appointmentId").lean();
    }

    async findByDoctorId(doctorId: Types.ObjectId): Promise<IPrescription[]> {
        return await Prescription.find({ doctorId }).populate("patientId").populate("appointmentId").lean();
    }

    async findByBranchId(branchId: Types.ObjectId): Promise<IPrescription[]> {
        return await Prescription.find({ branchId }).populate("patientId").populate("doctorId", "-password").populate("appointmentId").lean();
    }
    
    async findByAppointmentId(appointmentId: Types.ObjectId): Promise<IPrescription[]> {
        return await Prescription.find({ appointmentId }).populate("patientId").populate("doctorId", "-password").lean();
    }

    async update(id: Types.ObjectId, data: UpdatePrescriptionDto): Promise<IPrescription | null> {
        return await Prescription.findByIdAndUpdate(id, data, { new: true }).populate("patientId").populate("doctorId", "-password").populate("branchId").populate("appointmentId").lean();
    }

    async delete(id: Types.ObjectId): Promise<IPrescription | null> {
        return await Prescription.findByIdAndDelete(id).lean();
    }
}

export default new PrescriptionRepository();
