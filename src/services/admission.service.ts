import admissionRepository, { AdmissionRepository } from "@/repositories/admission.repository";
import { Types } from "mongoose";
import { IAdmission } from "@/interfaces/admission.interface";
import { CreateAdmissionDto, UpdateAdmissionDto } from "@/dto/admission.dto";

export class AdmissionService {
    constructor(private repository: AdmissionRepository = admissionRepository) { }

    async createAdmission(data: CreateAdmissionDto): Promise<IAdmission> {
        return await this.repository.create(data);
    }

    async getAllAdmissions(): Promise<IAdmission[]> {
        return await this.repository.findAll();
    }

    async getAdmissionById(id: Types.ObjectId): Promise<IAdmission | null> {
        return await this.repository.findById(id);
    }

    async getAdmissionsByPatientId(patientId: Types.ObjectId): Promise<IAdmission[]> {
        return await this.repository.findByPatientId(patientId);
    }

    async getAdmissionsByDoctorId(doctorId: Types.ObjectId): Promise<IAdmission[]> {
        return await this.repository.findByDoctorId(doctorId);
    }

    async getAdmissionsByBranchId(branchId: Types.ObjectId): Promise<IAdmission[]> {
        return await this.repository.findByBranchId(branchId);
    }
    
    async getAdmissionsByBedId(bedId: Types.ObjectId): Promise<IAdmission[]> {
        return await this.repository.findByBedId(bedId);
    }

    async updateAdmission(id: Types.ObjectId, data: UpdateAdmissionDto): Promise<IAdmission | null> {
        const admission = await this.repository.findById(id);
        if (!admission) {
            throw { statusCode: 404, message: "Admission not found" };
        }
        return await this.repository.update(id, data);
    }

    async deleteAdmission(id: Types.ObjectId): Promise<IAdmission | null> {
        const admission = await this.repository.findById(id);
        if (!admission) {
            throw { statusCode: 404, message: "Admission not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new AdmissionService();
