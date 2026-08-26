import { NextResponse } from "next/server";
import { inventoryService } from "@/services/inventory.service";
import dbConnect from "@/lib/dbConnect";

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');
        const transactions = await inventoryService.getStockTransactions(itemId || undefined);
        return NextResponse.json(transactions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch stock transactions" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const transaction = await inventoryService.createStockTransaction(body);
        return NextResponse.json(transaction, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create stock transaction" }, { status: 500 });
    }
}
