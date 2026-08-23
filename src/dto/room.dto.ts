import { Types } from "mongoose";

export interface CreateRoomDto {
    roomNumber: string;
    roomType?: string; // Optional due to default in schema
    wardId: Types.ObjectId | string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateRoomDto {
    roomNumber?: string;
    roomType?: string;
    wardId?: Types.ObjectId | string;
    description?: string;
    isActive?: boolean;
}
