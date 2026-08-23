import { Types } from "mongoose";
import Patient from "@/models/patient.model";
import { IPatient } from "@/interfaces/patient.interface";
import { CreatePatientDto, UpdatePatientDto } from "@/dto/patient.dto";

export class PatientRepository {
    async create(data: CreatePatientDto): Promise<IPatient> {
        return await new Patient(data).save();
    }

    async findAll(): Promise<IPatient[]> {
        return await Patient.find().populate("branchId").lean();
    }

    async findById(id: Types.ObjectId): Promise<IPatient | null> {
        return await Patient.findById(id).populate("branchId").lean();
    }

    async findByBranchId(branchId: Types.ObjectId): Promise<IPatient[]> {
        return await Patient.find({ branchId }).populate("branchId").lean();
    }

    async update(id: Types.ObjectId, data: UpdatePatientDto): Promise<IPatient | null> {
        return await Patient.findByIdAndUpdate(id, data, { new: true }).populate("branchId").lean();
    }

    async delete(id: Types.ObjectId): Promise<IPatient | null> {
        return await Patient.findByIdAndDelete(id).lean();
    }
}

export default new PatientRepository();
