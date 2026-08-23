import roomRepository, { RoomRepository } from "@/repositories/room.repository";
import { Types } from "mongoose";
import { IRoom } from "@/interfaces/room.interface";
import { CreateRoomDto, UpdateRoomDto } from "@/dto/room.dto";

export class RoomService {
    constructor(private repository: RoomRepository = roomRepository) { }

    async createRoom(data: CreateRoomDto): Promise<IRoom> {
        const existing = await this.repository.findByRoomNumber(data.roomNumber);
        if (existing) {
            throw { statusCode: 409, message: `Room with number '${data.roomNumber}' already exists` };
        }
        return await this.repository.create(data);
    }

    async getAllRooms(): Promise<IRoom[]> {
        return await this.repository.findAll();
    }

    async getRoomById(id: Types.ObjectId): Promise<IRoom | null> {
        return await this.repository.findById(id);
    }

    async getRoomsByWardId(wardId: Types.ObjectId): Promise<IRoom[]> {
        return await this.repository.findByWardId(wardId);
    }

    async updateRoom(id: Types.ObjectId, data: UpdateRoomDto): Promise<IRoom | null> {
        const room = await this.repository.findById(id);
        if (!room) {
            throw { statusCode: 404, message: "Room not found" };
        }
        if (data.roomNumber) {
            const existing = await this.repository.findByRoomNumber(data.roomNumber);
            if (existing && existing._id.toString() !== id.toString()) {
                throw { statusCode: 409, message: `Room with number '${data.roomNumber}' already exists` };
            }
        }
        return await this.repository.update(id, data);
    }

    async deleteRoom(id: Types.ObjectId): Promise<IRoom | null> {
        const room = await this.repository.findById(id);
        if (!room) {
            throw { statusCode: 404, message: "Room not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new RoomService();
