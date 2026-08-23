import { Types } from "mongoose";
import Inventory from "@/models/inventory.model";
import { IInventory } from "@/interfaces/inventory.interface";
import { CreateInventoryDto, UpdateInventoryDto } from "@/dto/inventory.dto";

export class InventoryRepository {
    async create(data: CreateInventoryDto): Promise<IInventory> {
        return await new Inventory(data).save();
    }

    async findAll(): Promise<IInventory[]> {
        return await Inventory.find().populate("branchId").lean();
    }

    async findById(id: Types.ObjectId): Promise<IInventory | null> {
        return await Inventory.findById(id).populate("branchId").lean();
    }

    async findByBranchId(branchId: Types.ObjectId): Promise<IInventory[]> {
        return await Inventory.find({ branchId }).populate("branchId").lean();
    }

    async update(id: Types.ObjectId, data: UpdateInventoryDto): Promise<IInventory | null> {
        return await Inventory.findByIdAndUpdate(id, data, { new: true }).populate("branchId").lean();
    }

    async delete(id: Types.ObjectId): Promise<IInventory | null> {
        return await Inventory.findByIdAndDelete(id).lean();
    }
}

export default new InventoryRepository();
