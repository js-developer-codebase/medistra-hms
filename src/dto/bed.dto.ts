import { Types } from "mongoose";

export interface CreateBedDto {
    bedNumber: string;
    roomId: Types.ObjectId | string;
    bedType?: string; // Optional due to default in schema
    status?: string; // Optional due to default in schema
    isActive?: boolean;
}

export interface UpdateBedDto {
    bedNumber?: string;
    roomId?: Types.ObjectId | string;
    bedType?: string;
    status?: string;
    isActive?: boolean;
}
