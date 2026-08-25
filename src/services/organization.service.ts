import organizationRepository, { OrganizationRepository } from "@/repositories/organization.repository";
import { Types } from "mongoose";
import { IOrganization } from "@/interfaces/organization.interface";

export class OrganizationService {
    constructor(private repository: OrganizationRepository = organizationRepository) { }

    async createOrganization(data: { organizationName: string, organizationId: string, organizationType: string, headQuarter?: Types.ObjectId, branchType: string, email: string, phone: string, address: string, logo?: string }): Promise<IOrganization> {
        return await this.repository.create(data);
    }

    async getAllOrganizations(): Promise<IOrganization[]> {
        return await this.repository.findAll();
    }

    async getOrganizationById(id: Types.ObjectId): Promise<IOrganization | null> {
        return await this.repository.findById(id);
    }

    async getOrganizationByName(name: string): Promise<IOrganization | null> {
        return await this.repository.findByName(name);
    }

    async getOrganizationByOrganizationId(organizationId: string): Promise<IOrganization | null> {
        return await this.repository.findByOrganizationId(organizationId);
    }

    async updateOrganization(id: Types.ObjectId, data: { organizationName?: string; organizationId?: string; organizationType?: string; headQuarter?: Types.ObjectId; branchType?: string; email?: string; phone?: string; address?: string; logo?: string; }): Promise<IOrganization | null> {
        return await this.repository.update(id, data);
    }

    async deleteOrganization(id: Types.ObjectId): Promise<IOrganization | null> {
        return await this.repository.delete(id);
    }
}

export default new OrganizationService();