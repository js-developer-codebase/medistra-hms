import { Types } from "mongoose";
import Organization from "@/models/organization.model";
import { IOrganization } from "@/interfaces/organization.interface";

export class OrganizationRepository {
    async create(data: { organizationName: string, organizationId: string, organizationType: string, headQuarter?: Types.ObjectId, branchType: string, email: string, phone: string, address: string, logo?: string }): Promise<IOrganization> {
        return await new Organization(data).save();
    }
    async findAll(): Promise<IOrganization[]> {
        return await Organization.find().lean();
    }

    async findById(id: Types.ObjectId): Promise<IOrganization | null> {
        return await Organization.findById(id).lean();
    }

    async findByName(name: string): Promise<IOrganization | null> {
        return await Organization.findOne({ organizationName: name }).lean();
    }

    async findByOrganizationId(organizationId: string): Promise<IOrganization | null> {
        return await Organization.findOne({ organizationId }).lean();
    }

    async update(id: Types.ObjectId, data: { organizationName?: string; organizationId?: string; organizationType?: string; headQuarter?: Types.ObjectId; branchType?: string; email?: string; phone?: string; address?: string; logo?: string; }): Promise<IOrganization | null> {
        return await Organization.findByIdAndUpdate(id, data, { new: true }).lean();
    }

    async delete(id: Types.ObjectId): Promise<IOrganization | null> {
        return await Organization.findByIdAndDelete(id).lean();
    }
}

export default new OrganizationRepository();