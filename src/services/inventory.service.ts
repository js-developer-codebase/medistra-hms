import inventoryRepository, { InventoryRepository } from "@/repositories/inventory.repository";
import { Types } from "mongoose";
import { IInventory } from "@/interfaces/inventory.interface";
import { CreateInventoryDto, UpdateInventoryDto } from "@/dto/inventory.dto";

export class InventoryService {
    constructor(private repository: InventoryRepository = inventoryRepository) { }

    async createInventory(data: CreateInventoryDto): Promise<IInventory> {
        return await this.repository.create(data);
    }

    async getAllInventories(): Promise<IInventory[]> {
        return await this.repository.findAll();
    }

    async getInventoryById(id: Types.ObjectId): Promise<IInventory | null> {
        return await this.repository.findById(id);
    }

    async getInventoriesByBranchId(branchId: Types.ObjectId): Promise<IInventory[]> {
        return await this.repository.findByBranchId(branchId);
    }

    async updateInventory(id: Types.ObjectId, data: UpdateInventoryDto): Promise<IInventory | null> {
        const inventory = await this.repository.findById(id);
        if (!inventory) {
            throw { statusCode: 404, message: "Inventory item not found" };
        }
        return await this.repository.update(id, data);
    }

    async deleteInventory(id: Types.ObjectId): Promise<IInventory | null> {
        const inventory = await this.repository.findById(id);
        if (!inventory) {
            throw { statusCode: 404, message: "Inventory item not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new InventoryService();
