import bedRepository, { BedRepository } from "@/repositories/bed.repository";
import { Types } from "mongoose";
import { IBed } from "@/interfaces/bed.interface";
import { CreateBedDto, UpdateBedDto } from "@/dto/bed.dto";

export class BedService {
    constructor(private repository: BedRepository = bedRepository) { }

    async createBed(data: CreateBedDto): Promise<IBed> {
        const existing = await this.repository.findByBedNumber(data.bedNumber);
        if (existing) {
            throw { statusCode: 409, message: `Bed with number '${data.bedNumber}' already exists` };
        }
        return await this.repository.create(data);
    }

    async getAllBeds(query: any = {}): Promise<IBed[]> {
        return await this.repository.findAll(query);
    }

    async getBedById(id: Types.ObjectId): Promise<IBed | null> {
        return await this.repository.findById(id);
    }

    async getBedsByRoomId(roomId: Types.ObjectId): Promise<IBed[]> {
        return await this.repository.findByRoomId(roomId);
    }

    async updateBed(id: Types.ObjectId, data: UpdateBedDto): Promise<IBed | null> {
        const bed = await this.repository.findById(id);
        if (!bed) {
            throw { statusCode: 404, message: "Bed not found" };
        }
        if (data.bedNumber) {
            const existing = await this.repository.findByBedNumber(data.bedNumber);
            if (existing && existing._id.toString() !== id.toString()) {
                throw { statusCode: 409, message: `Bed with number '${data.bedNumber}' already exists` };
            }
        }
        return await this.repository.update(id, data);
    }

    async deleteBed(id: Types.ObjectId): Promise<IBed | null> {
        const bed = await this.repository.findById(id);
        if (!bed) {
            throw { statusCode: 404, message: "Bed not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new BedService();
