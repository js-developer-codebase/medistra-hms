import { Types } from "mongoose";
import Department from "@/models/department.model";
import { IDepartment } from "@/interfaces/department.interface";
import { CreateDepartmentDto, UpdateDepartmentDto } from "@/dto/department.dto";

export class DepartmentRepository {
    async create(data: CreateDepartmentDto): Promise<IDepartment> {
        return await new Department(data).save();
    }

    async findAll(): Promise<IDepartment[]> {
        return await Department.find().lean();
    }

    async findById(id: Types.ObjectId): Promise<IDepartment | null> {
        return await Department.findById(id).lean();
    }

    async findByCode(code: string): Promise<IDepartment | null> {
        return await Department.findOne({ code }).lean();
    }

    async findByOrganizationId(organizationId: Types.ObjectId): Promise<IDepartment[]> {
        return await Department.find({ organizationId }).lean();
    }

    async update(id: Types.ObjectId, data: UpdateDepartmentDto): Promise<IDepartment | null> {
        return await Department.findByIdAndUpdate(id, data, { new: true }).lean();
    }

    async delete(id: Types.ObjectId): Promise<IDepartment | null> {
        return await Department.findByIdAndDelete(id).lean();
    }
}

export default new DepartmentRepository();
