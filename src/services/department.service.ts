import departmentRepository, { DepartmentRepository } from "@/repositories/department.repository";
import { Types } from "mongoose";
import { IDepartment } from "@/interfaces/department.interface";
import { CreateDepartmentDto, UpdateDepartmentDto } from "@/dto/department.dto";

export class DepartmentService {
    constructor(private repository: DepartmentRepository = departmentRepository) { }

    async createDepartment(data: CreateDepartmentDto): Promise<IDepartment> {
        const existing = await this.repository.findByCode(data.code);
        if (existing) {
            throw { statusCode: 409, message: `Department with code '${data.code}' already exists` };
        }
        return await this.repository.create(data);
    }

    async getAllDepartments(): Promise<IDepartment[]> {
        return await this.repository.findAll();
    }

    async getDepartmentById(id: Types.ObjectId): Promise<IDepartment | null> {
        return await this.repository.findById(id);
    }

    async getDepartmentsByOrganizationId(organizationId: Types.ObjectId): Promise<IDepartment[]> {
        return await this.repository.findByOrganizationId(organizationId);
    }

    async updateDepartment(id: Types.ObjectId, data: UpdateDepartmentDto): Promise<IDepartment | null> {
        const department = await this.repository.findById(id);
        if (!department) {
            throw { statusCode: 404, message: "Department not found" };
        }
        if (data.code) {
            const existing = await this.repository.findByCode(data.code);
            if (existing && existing._id.toString() !== id.toString()) {
                throw { statusCode: 409, message: `Department with code '${data.code}' already exists` };
            }
        }
        return await this.repository.update(id, data);
    }

    async deleteDepartment(id: Types.ObjectId): Promise<IDepartment | null> {
        const department = await this.repository.findById(id);
        if (!department) {
            throw { statusCode: 404, message: "Department not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new DepartmentService();
