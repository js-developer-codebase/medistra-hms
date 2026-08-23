import { NextRequest, NextResponse } from "next/server";
import InvoiceController from "@/controllers/invoice.controller";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return InvoiceController.getInvoiceById(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch invoice"
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return InvoiceController.updateInvoice(request, id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to update invoice"
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const { id } = await params;
        return InvoiceController.deleteInvoice(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to delete invoice"
        }, { status: 500 });
    }
}
