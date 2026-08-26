import { NextRequest, NextResponse } from "next/server";
import PaymentController from "@/controllers/payment.controller";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        const { id } = await params;
        return PaymentController.getPaymentById(id);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch payment"
        }, { status: 500 });
    }
}
