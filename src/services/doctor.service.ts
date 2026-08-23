import doctorRepository, { DoctorRepository } from "@/repositories/doctor.repository";
import { Types } from "mongoose";
import { IDoctor } from "@/interfaces/doctor.interface";
import { CreateDoctorDto, UpdateDoctorDto } from "@/dto/doctor.dto";

export class DoctorService {
    constructor(private repository: DoctorRepository = doctorRepository) { }

    async createDoctor(data: CreateDoctorDto): Promise<IDoctor> {
        const existingByUser = await this.repository.findByUserId(new Types.ObjectId(data.userId));
        if (existingByUser) {
            throw { statusCode: 409, message: "A doctor profile already exists for this user" };
        }
        const existingByLicense = await this.repository.findByLicenseNo(data.licenseNo);
        if (existingByLicense) {
            throw { statusCode: 409, message: `License number '${data.licenseNo}' is already registered` };
        }
        return await this.repository.create(data);
    }

    async getAllDoctors(): Promise<IDoctor[]> {
        return await this.repository.findAll();
    }

    async getDoctorById(id: Types.ObjectId): Promise<IDoctor | null> {
        return await this.repository.findById(id);
    }

    async getDoctorByUserId(userId: Types.ObjectId): Promise<IDoctor | null> {
        return await this.repository.findByUserId(userId);
    }

    async getDoctorsByDepartmentId(departmentId: Types.ObjectId): Promise<IDoctor[]> {
        return await this.repository.findByDepartmentId(departmentId);
    }

    async updateDoctor(id: Types.ObjectId, data: UpdateDoctorDto): Promise<IDoctor | null> {
        const doctor = await this.repository.findById(id);
        if (!doctor) {
            throw { statusCode: 404, message: "Doctor not found" };
        }
        if (data.licenseNo) {
            const existing = await this.repository.findByLicenseNo(data.licenseNo);
            if (existing && existing._id.toString() !== id.toString()) {
                throw { statusCode: 409, message: `License number '${data.licenseNo}' is already registered` };
            }
        }
        if (data.userId) {
            const existing = await this.repository.findByUserId(new Types.ObjectId(data.userId));
            if (existing && existing._id.toString() !== id.toString()) {
                throw { statusCode: 409, message: "A doctor profile already exists for this user" };
            }
        }
        return await this.repository.update(id, data);
    }

    async deleteDoctor(id: Types.ObjectId): Promise<IDoctor | null> {
        const doctor = await this.repository.findById(id);
        if (!doctor) {
            throw { statusCode: 404, message: "Doctor not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new DoctorService();
