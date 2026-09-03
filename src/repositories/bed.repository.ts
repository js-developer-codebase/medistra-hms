import { Types } from "mongoose";
import Bed from "@/models/bed.model";
// Ensure referenced models are registered in Mongoose
import "@/models/room.model";
import "@/models/ward.model";
import "@/models/organization.model";
import { IBed } from "@/interfaces/bed.interface";
import { CreateBedDto, UpdateBedDto } from "@/dto/bed.dto";

export class BedRepository {
    async create(data: CreateBedDto): Promise<IBed> {
        return await new Bed(data).save();
    }

    async findAll(query: any = {}): Promise<IBed[]> {
        return await Bed.find(query).populate({ path: "roomId", populate: { path: "wardId", populate: { path: "organizationId" } } }).lean();
    }

    async findById(id: Types.ObjectId): Promise<IBed | null> {
        return await Bed.findById(id).populate({ path: "roomId", populate: { path: "wardId", populate: { path: "organizationId" } } }).lean();
    }

    async findByBedNumber(bedNumber: string): Promise<IBed | null> {
        return await Bed.findOne({ bedNumber }).populate({ path: "roomId", populate: { path: "wardId", populate: { path: "organizationId" } } }).lean();
    }

    async findByRoomId(roomId: Types.ObjectId): Promise<IBed[]> {
        return await Bed.find({ roomId }).populate({ path: "roomId", populate: { path: "wardId", populate: { path: "organizationId" } } }).lean();
    }

    async update(id: Types.ObjectId, data: UpdateBedDto): Promise<IBed | null> {
        return await Bed.findByIdAndUpdate(id, data, { new: true }).lean();
    }

    async delete(id: Types.ObjectId): Promise<IBed | null> {
        return await Bed.findByIdAndDelete(id).lean();
    }
}

export default new BedRepository();
