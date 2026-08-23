import { Types } from "mongoose";

export interface CreateWardDto {
    wardName: string;
    wardCode: string;
    wardType?: string; // Optional due to default in schema
    floor: number;
    organizationId: Types.ObjectId | string;
    isActive?: boolean;
}

export interface UpdateWardDto {
    wardName?: string;
    wardCode?: string;
    wardType?: string;
    floor?: number;
    organizationId?: Types.ObjectId | string;
    isActive?: boolean;
}
