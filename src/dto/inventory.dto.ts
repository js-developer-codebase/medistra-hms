import { Types } from "mongoose";

export interface CreateInventoryDto {
    name: string;
    type: string;
    price: number;
    inward: number;
    outward: number;
    stock: number;
    expiryDate: Date | string;
    batchNo: string;
    branchId: Types.ObjectId | string;
}

export interface UpdateInventoryDto {
    name?: string;
    type?: string;
    price?: number;
    inward?: number;
    outward?: number;
    stock?: number;
    expiryDate?: Date | string;
    batchNo?: string;
    branchId?: Types.ObjectId | string;
}
