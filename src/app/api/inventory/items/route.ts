import { NextResponse } from "next/server";
import { inventoryService } from "@/services/inventory.service";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
    try {
        await dbConnect();
        const items = await inventoryService.getItems();
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch inventory items" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const newItem = await inventoryService.createItem(body);
        return NextResponse.json(newItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create inventory item" }, { status: 500 });
    }
}
