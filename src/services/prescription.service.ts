import prescriptionRepository, { PrescriptionRepository } from "@/repositories/prescription.repository";
import { Types } from "mongoose";
import { IPrescription } from "@/interfaces/prescription.interface";
import { CreatePrescriptionDto, UpdatePrescriptionDto } from "@/dto/prescription.dto";

export class PrescriptionService {
    constructor(private repository: PrescriptionRepository = prescriptionRepository) { }

    async createPrescription(data: CreatePrescriptionDto): Promise<IPrescription> {
        return await this.repository.create(data);
    }

    async getAllPrescriptions(): Promise<IPrescription[]> {
        return await this.repository.findAll();
    }

    async getPrescriptionById(id: Types.ObjectId): Promise<IPrescription | null> {
        return await this.repository.findById(id);
    }

    async getPrescriptionsByPatientId(patientId: Types.ObjectId): Promise<IPrescription[]> {
        return await this.repository.findByPatientId(patientId);
    }

    async getPrescriptionsByDoctorId(doctorId: Types.ObjectId): Promise<IPrescription[]> {
        return await this.repository.findByDoctorId(doctorId);
    }

    async getPrescriptionsByBranchId(branchId: Types.ObjectId): Promise<IPrescription[]> {
        return await this.repository.findByBranchId(branchId);
    }
    
    async getPrescriptionsByAppointmentId(appointmentId: Types.ObjectId): Promise<IPrescription[]> {
        return await this.repository.findByAppointmentId(appointmentId);
    }

    async updatePrescription(id: Types.ObjectId, data: UpdatePrescriptionDto): Promise<IPrescription | null> {
        const prescription = await this.repository.findById(id);
        if (!prescription) {
            throw { statusCode: 404, message: "Prescription not found" };
        }
        return await this.repository.update(id, data);
    }

    async deletePrescription(id: Types.ObjectId): Promise<IPrescription | null> {
        const prescription = await this.repository.findById(id);
        if (!prescription) {
            throw { statusCode: 404, message: "Prescription not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new PrescriptionService();
