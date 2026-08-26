import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultPaymentService, { PaymentService } from "@/services/payment.service";
import { CreatePaymentDto, UpdatePaymentDto } from "@/dto/payment.dto";

export class PaymentController {
    constructor(private paymentService: PaymentService = defaultPaymentService) { }

    async createPayment(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreatePaymentDto = await request.json();

            if (!data.invoiceId || !data.patientId || data.amount === undefined || !data.method || !data.branchId) {
                return NextResponse.json(
                    { success: false, message: "Required fields are missing" },
                    { status: 400 }
                );
            }

            const payment = await this.paymentService.createPayment(data);

            return NextResponse.json(
                { success: true, message: "Payment created successfully", data: payment },
                { status: 201 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create payment" },
                { status: 500 }
            );
        }
    }

    async getPayments(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();

            const { searchParams } = new URL(request.url);
            const branchId = searchParams.get('branchId');
            const invoiceId = searchParams.get('invoiceId');

            let payments;

            if (branchId) {
                if (!Types.ObjectId.isValid(branchId)) return NextResponse.json({ success: false, message: "Invalid branch ID" }, { status: 400 });
                payments = await this.paymentService.getPaymentsByBranchId(new Types.ObjectId(branchId));
            } else if (invoiceId) {
                if (!Types.ObjectId.isValid(invoiceId)) return NextResponse.json({ success: false, message: "Invalid invoice ID" }, { status: 400 });
                payments = await this.paymentService.getPaymentsByInvoiceId(new Types.ObjectId(invoiceId));
            } else {
                payments = await this.paymentService.getAllPayments();
            }

            return NextResponse.json(
                { success: true, count: payments.length, data: payments },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch payments" },
                { status: 500 }
            );
        }
    }

    async getPaymentById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid payment ID" },
                    { status: 400 }
                );
            }

            const payment = await this.paymentService.getPaymentById(new Types.ObjectId(id));
            if (!payment) {
                return NextResponse.json(
                    { success: false, message: "Payment not found" },
                    { status: 440 }
                );
            }

            return NextResponse.json(
                { success: true, data: payment },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch payment" },
                { status: 500 }
            );
        }
    }
}

export default new PaymentController();
