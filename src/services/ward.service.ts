import wardRepository, { WardRepository } from "@/repositories/ward.repository";
import { Types } from "mongoose";
import { IWard } from "@/interfaces/ward.interface";
import { CreateWardDto, UpdateWardDto } from "@/dto/ward.dto";

export class WardService {
    constructor(private repository: WardRepository = wardRepository) { }

    async createWard(data: CreateWardDto): Promise<IWard> {
        const existing = await this.repository.findByWardCode(data.wardCode);
        if (existing) {
            throw { statusCode: 409, message: `Ward with code '${data.wardCode}' already exists` };
        }
        return await this.repository.create(data);
    }

    async getAllWards(): Promise<IWard[]> {
        return await this.repository.findAll();
    }

    async getWardById(id: Types.ObjectId): Promise<IWard | null> {
        return await this.repository.findById(id);
    }

    async getWardsByOrganizationId(organizationId: Types.ObjectId): Promise<IWard[]> {
        return await this.repository.findByOrganizationId(organizationId);
    }

    async updateWard(id: Types.ObjectId, data: UpdateWardDto): Promise<IWard | null> {
        const ward = await this.repository.findById(id);
        if (!ward) {
            throw { statusCode: 404, message: "Ward not found" };
        }
        if (data.wardCode) {
            const existing = await this.repository.findByWardCode(data.wardCode);
            if (existing && existing._id.toString() !== id.toString()) {
                throw { statusCode: 409, message: `Ward with code '${data.wardCode}' already exists` };
            }
        }
        return await this.repository.update(id, data);
    }

    async deleteWard(id: Types.ObjectId): Promise<IWard | null> {
        const ward = await this.repository.findById(id);
        if (!ward) {
            throw { statusCode: 404, message: "Ward not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new WardService();
