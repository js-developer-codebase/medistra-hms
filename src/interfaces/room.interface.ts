import { Document, Types } from "mongoose";
export interface IRoom extends Document {
    roomNumber: string;
    roomType: string;
    wardId: Types.ObjectId;
    description?: string;
    isActive: boolean;
}