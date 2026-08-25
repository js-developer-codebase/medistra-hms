import { Types } from "mongoose";
import Role from "@/models/role.model";
import { IRole } from "@/interfaces/role.interface";
import { CreateRoleDto, UpdateRoleDto } from "@/dto/role.dto";

export class RoleRepository {
    async create(data: CreateRoleDto): Promise<IRole> {
        return await new Role(data).save();
    }

    async findAll(): Promise<IRole[]> {
        return await Role.find().populate("managedRoles.roleId").lean();
    }

    async findById(id: Types.ObjectId): Promise<IRole | null> {
        return await Role.findById(id).populate("managedRoles.roleId").lean();
    }

    async findByName(role: string): Promise<IRole | null> {
        return await Role.findOne({ role }).populate("managedRoles.roleId").lean();
    }

    async update(id: Types.ObjectId, data: UpdateRoleDto): Promise<IRole | null> {
        return await Role.findByIdAndUpdate(id, data, { new: true }).populate("managedRoles.roleId").lean();
    }

    async delete(id: Types.ObjectId): Promise<IRole | null> {
        return await Role.findByIdAndDelete(id).lean();
    }
}

export default new RoleRepository();
