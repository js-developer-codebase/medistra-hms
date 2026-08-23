import { Types } from "mongoose";
import Doctor from "@/models/doctor.model";
import { IDoctor } from "@/interfaces/doctor.interface";
import { CreateDoctorDto, UpdateDoctorDto } from "@/dto/doctor.dto";

export class DoctorRepository {
    async create(data: CreateDoctorDto): Promise<IDoctor> {
        return await new Doctor(data).save();
    }

    async findAll(): Promise<IDoctor[]> {
        return await Doctor.find().populate("userId", "-password").populate("departmentId").lean();
    }

    async findById(id: Types.ObjectId): Promise<IDoctor | null> {
        return await Doctor.findById(id).populate("userId", "-password").populate("departmentId").lean();
    }

    async findByUserId(userId: Types.ObjectId): Promise<IDoctor | null> {
        return await Doctor.findOne({ userId }).populate("userId", "-password").populate("departmentId").lean();
    }

    async findByLicenseNo(licenseNo: string): Promise<IDoctor | null> {
        return await Doctor.findOne({ licenseNo }).lean();
    }

    async findByDepartmentId(departmentId: Types.ObjectId): Promise<IDoctor[]> {
        return await Doctor.find({ departmentId }).populate("userId", "-password").lean();
    }

    async update(id: Types.ObjectId, data: UpdateDoctorDto): Promise<IDoctor | null> {
        return await Doctor.findByIdAndUpdate(id, data, { new: true }).populate("userId", "-password").populate("departmentId").lean();
    }

    async delete(id: Types.ObjectId): Promise<IDoctor | null> {
        return await Doctor.findByIdAndDelete(id).lean();
    }
}

export default new DoctorRepository();
