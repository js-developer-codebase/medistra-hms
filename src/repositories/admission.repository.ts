import { Types } from "mongoose";
import Admission from "@/models/admission.model";
import { IAdmission } from "@/interfaces/admission.interface";
import { CreateAdmissionDto, UpdateAdmissionDto } from "@/dto/admission.dto";

export class AdmissionRepository {
    async create(data: CreateAdmissionDto): Promise<IAdmission> {
        return await new Admission(data).save();
    }

    async findAll(): Promise<IAdmission[]> {
        return await Admission.find().populate("patientId").populate("doctorId", "-password").populate("branchId").populate("bedId").lean();
    }

    async findById(id: Types.ObjectId): Promise<IAdmission | null> {
        return await Admission.findById(id).populate("patientId").populate("doctorId", "-password").populate("branchId").populate("bedId").lean();
    }

    async findByPatientId(patientId: Types.ObjectId): Promise<IAdmission[]> {
        return await Admission.find({ patientId }).populate("doctorId", "-password").populate("bedId").lean();
    }

    async findByDoctorId(doctorId: Types.ObjectId): Promise<IAdmission[]> {
        return await Admission.find({ doctorId }).populate("patientId").populate("bedId").lean();
    }

    async findByBranchId(branchId: Types.ObjectId): Promise<IAdmission[]> {
        return await Admission.find({ branchId }).populate("patientId").populate("doctorId", "-password").populate("bedId").lean();
    }
    
    async findByBedId(bedId: Types.ObjectId): Promise<IAdmission[]> {
        return await Admission.find({ bedId }).populate("patientId").populate("doctorId", "-password").lean();
    }

    async update(id: Types.ObjectId, data: UpdateAdmissionDto): Promise<IAdmission | null> {
        return await Admission.findByIdAndUpdate(id, data, { new: true }).populate("patientId").populate("doctorId", "-password").populate("branchId").populate("bedId").lean();
    }

    async delete(id: Types.ObjectId): Promise<IAdmission | null> {
        return await Admission.findByIdAndDelete(id).lean();
    }
}

export default new AdmissionRepository();
