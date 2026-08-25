import { NextResponse } from "next/server";
import { procurementService } from "@/services/procurement.service";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
    try {
        await dbConnect();
        const orders = await procurementService.getPurchaseOrders();
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const newOrder = await procurementService.createPurchaseOrder(body);
        return NextResponse.json(newOrder, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create purchase order" }, { status: 500 });
    }
}
