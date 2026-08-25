import { Types } from "mongoose";
import Room from "@/models/room.model";
import { IRoom } from "@/interfaces/room.interface";
import { CreateRoomDto, UpdateRoomDto } from "@/dto/room.dto";

export class RoomRepository {
    async create(data: CreateRoomDto): Promise<IRoom> {
        return await new Room(data).save();
    }

    async findAll(): Promise<IRoom[]> {
        return await Room.find().populate({ path: "wardId", populate: { path: "organizationId" } }).lean();
    }

    async findById(id: Types.ObjectId): Promise<IRoom | null> {
        return await Room.findById(id).populate({ path: "wardId", populate: { path: "organizationId" } }).lean();
    }

    async findByRoomNumber(roomNumber: string): Promise<IRoom | null> {
        return await Room.findOne({ roomNumber }).populate({ path: "wardId", populate: { path: "organizationId" } }).lean();
    }

    async findByWardId(wardId: Types.ObjectId): Promise<IRoom[]> {
        return await Room.find({ wardId }).populate({ path: "wardId", populate: { path: "organizationId" } }).lean();
    }

    async update(id: Types.ObjectId, data: UpdateRoomDto): Promise<IRoom | null> {
        return await Room.findByIdAndUpdate(id, data, { new: true }).lean();
    }

    async delete(id: Types.ObjectId): Promise<IRoom | null> {
        return await Room.findByIdAndDelete(id).lean();
    }
}

export default new RoomRepository();
