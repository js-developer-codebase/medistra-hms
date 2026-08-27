import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { inventoryService, InventoryService } from "@/services/inventory.service";
import { CreateInventoryDto, UpdateInventoryDto } from "@/dto/inventory.dto";

export class InventoryController {
    constructor(private svc: InventoryService = inventoryService) { }

    async createInventory(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateInventoryDto = await request.json();

            if (!data.name || !data.type || data.price === undefined || data.inward === undefined || data.outward === undefined || data.stock === undefined || !data.expiryDate || !data.batchNo || !data.branchId) {
                return NextResponse.json(
                    { success: false, message: "Required fields are missing" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.branchId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid branch ID format" },
                    { status: 400 }
                );
            }

            const inventory = await this.svc.createInventory(data);

            return NextResponse.json(
                { success: true, message: "Inventory item created successfully", data: inventory },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create inventory item" },
                { status: statusCode }
            );
        }
    }

    async getInventories(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();

            const { searchParams } = new URL(request.url);
            const branchId = searchParams.get('branchId');

            let inventories;

            if (branchId) {
                if (!Types.ObjectId.isValid(branchId)) return NextResponse.json({ success: false, message: "Invalid branch ID" }, { status: 400 });
                inventories = await this.svc.getInventoriesByBranchId(new Types.ObjectId(branchId));
            } else {
                inventories = await this.svc.getAllInventories();
            }

            return NextResponse.json(
                { success: true, count: inventories.length, data: inventories },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch inventories" },
                { status: 500 }
            );
        }
    }

    async getInventoryById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid inventory ID" },
                    { status: 400 }
                );
            }

            const inventory = await this.svc.getInventoryById(new Types.ObjectId(id));
            if (!inventory) {
                return NextResponse.json(
                    { success: false, message: "Inventory item not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: inventory },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch inventory item" },
                { status: 500 }
            );
        }
    }

    async updateInventory(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid inventory ID" },
                    { status: 400 }
                );
            }

            const data: UpdateInventoryDto = await request.json();

            if (data.branchId && !Types.ObjectId.isValid(data.branchId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid branch ID format" },
                    { status: 400 }
                );
            }

            const inventory = await this.svc.updateInventory(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "Inventory item updated successfully", data: inventory },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update inventory item" },
                { status: statusCode }
            );
        }
    }

    async deleteInventory(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid inventory ID" },
                    { status: 400 }
                );
            }

            await this.svc.deleteInventory(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Inventory item deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete inventory item" },
                { status: statusCode }
            );
        }
    }
}

export default new InventoryController();
