import { Document, Types } from "mongoose";

export interface IWard extends Document {
    wardName: string;
    wardCode: string;
    wardType: string;
    floor: number;
    organizationId: Types.ObjectId;
    isActive: boolean;
}