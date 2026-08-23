import patientRepository, { PatientRepository } from "@/repositories/patient.repository";
import { Types } from "mongoose";
import { IPatient } from "@/interfaces/patient.interface";
import { CreatePatientDto, UpdatePatientDto } from "@/dto/patient.dto";

export class PatientService {
    constructor(private repository: PatientRepository = patientRepository) { }

    async createPatient(data: CreatePatientDto): Promise<IPatient> {
        return await this.repository.create(data);
    }

    async getAllPatients(): Promise<IPatient[]> {
        return await this.repository.findAll();
    }

    async getPatientById(id: Types.ObjectId): Promise<IPatient | null> {
        return await this.repository.findById(id);
    }

    async getPatientsByBranchId(branchId: Types.ObjectId): Promise<IPatient[]> {
        return await this.repository.findByBranchId(branchId);
    }

    async updatePatient(id: Types.ObjectId, data: UpdatePatientDto): Promise<IPatient | null> {
        const patient = await this.repository.findById(id);
        if (!patient) {
            throw { statusCode: 404, message: "Patient not found" };
        }
        return await this.repository.update(id, data);
    }

    async deletePatient(id: Types.ObjectId): Promise<IPatient | null> {
        const patient = await this.repository.findById(id);
        if (!patient) {
            throw { statusCode: 404, message: "Patient not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new PatientService();
