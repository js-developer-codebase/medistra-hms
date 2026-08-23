import { NextRequest, NextResponse } from "next/server";
import InvoiceController from "@/controllers/invoice.controller";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return InvoiceController.createInvoice(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create invoice"
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return InvoiceController.getInvoices(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch invoices"
        }, { status: 500 });
    }
}
