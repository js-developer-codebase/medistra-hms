import { NextRequest, NextResponse } from "next/server";
import PaymentController from "@/controllers/payment.controller";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return PaymentController.createPayment(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create payment"
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return PaymentController.getPayments(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch payments"
        }, { status: 500 });
    }
}
