import { NextRequest, NextResponse } from "next/server";
import InventoryController from "@/controllers/inventory.controller";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return InventoryController.getInventoryById(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch inventory"
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return InventoryController.updateInventory(request, id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to update inventory"
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return InventoryController.deleteInventory(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to delete inventory"
        }, { status: 500 });
    }
}
