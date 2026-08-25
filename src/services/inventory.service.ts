import InventoryItem from "@/models/inventory-item.model";
import StockTransaction from "@/models/stock-transaction.model";
import { IInventoryItem } from "@/interfaces/inventory-item.interface";
import { IStockTransaction } from "@/interfaces/stock-transaction.interface";

export class InventoryService {
    async getItems() {
        return await InventoryItem.find().sort({ createdAt: -1 });
    }

    async getItemById(id: string) {
        return await InventoryItem.findById(id);
    }

    async createItem(data: Partial<IInventoryItem>) {
        return await InventoryItem.create(data);
    }

    async updateItem(id: string, data: Partial<IInventoryItem>) {
        return await InventoryItem.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteItem(id: string) {
        return await InventoryItem.findByIdAndDelete(id);
    }

    async getStockTransactions(itemId?: string) {
        if (itemId) {
            return await StockTransaction.find({ itemId }).populate('itemId').sort({ transactionDate: -1 });
        }
        return await StockTransaction.find().populate('itemId').sort({ transactionDate: -1 });
    }

    async createStockTransaction(data: Partial<IStockTransaction>) {
        const session = await InventoryItem.startSession();
        session.startTransaction();
        try {
            const transaction = await StockTransaction.create([data], { session });
            const item = await InventoryItem.findById(data.itemId).session(session);
            if (!item) throw new Error("Item not found");

            if (data.transactionType === "IN") {
                item.currentStock += data.quantity || 0;
            } else if (data.transactionType === "OUT") {
                item.currentStock -= data.quantity || 0;
            } else if (data.transactionType === "ADJUSTMENT") {
                item.currentStock = data.quantity || 0; // Assuming adjustment sets absolute stock or could be delta. Let's make it delta.
                // Wait, typically adjustment might just be the exact stock difference. Let's assume quantity is delta (+/-).
                item.currentStock += data.quantity || 0;
            }

            await item.save({ session });
            await session.commitTransaction();
            return transaction[0];
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

export const inventoryService = new InventoryService();
