import { Document, Types } from "mongoose";

export interface IInventory extends Document {
    name: string,
    type: string,
    price: number,
    inward: number,
    outward: number,
    stock: number,
    expiryDate: Date,
    batchNo: string,
    branchId: Types.ObjectId
}