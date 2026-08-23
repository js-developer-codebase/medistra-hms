import { NextRequest, NextResponse } from "next/server";
import InventoryController from "@/controllers/inventory.controller";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return InventoryController.createInventory(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create inventory"
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return InventoryController.getInventories(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch inventories"
        }, { status: 500 });
    }
}
