import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultFinanceService, { FinanceService } from "@/services/finance.service";

export class FinanceController {
    constructor(private financeService: FinanceService = defaultFinanceService) { }

    async getStats(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const stats = await this.financeService.getFinanceStats();
            return NextResponse.json({ success: true, data: stats }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch finance statistics" },
                { status: 500 }
            );
        }
    }

    async getReceipts(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const patientId = searchParams.get("patientId");
            const invoiceId = searchParams.get("invoiceId");

            const query: Record<string, any> = {};
            if (patientId && Types.ObjectId.isValid(patientId)) query.patientId = new Types.ObjectId(patientId);
            if (invoiceId && Types.ObjectId.isValid(invoiceId)) query.invoiceId = new Types.ObjectId(invoiceId);

            const receipts = await this.financeService.getReceipts(query);
            return NextResponse.json({ success: true, count: receipts.length, data: receipts }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch payment receipts" },
                { status: 500 }
            );
        }
    }

    async getRefunds(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const status = searchParams.get("status");
            const patientId = searchParams.get("patientId");

            const query: Record<string, any> = {};
            if (status) query.status = status;
            if (patientId && Types.ObjectId.isValid(patientId)) query.patientId = new Types.ObjectId(patientId);

            const refunds = await this.financeService.getRefunds(query);
            return NextResponse.json({ success: true, count: refunds.length, data: refunds }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch refunds" },
                { status: 500 }
            );
        }
    }

    async createRefund(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const body = await request.json();

            if (!body.patientId || body.amount === undefined || !body.reason) {
                return NextResponse.json(
                    { success: false, message: "Patient, amount, and reason are required" },
                    { status: 400 }
                );
            }

            const refund = await this.financeService.createRefund(body);
            return NextResponse.json({ success: true, message: "Refund requested successfully", data: refund }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create refund" },
                { status: 500 }
            );
        }
    }

    async updateRefundStatus(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();
            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json({ success: false, message: "Invalid refund ID" }, { status: 400 });
            }

            const body = await request.json();
            const { status, approvedBy, notes } = body;

            if (!status) {
                return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 });
            }

            const updated = await this.financeService.updateRefundStatus(id, status, approvedBy, notes);
            return NextResponse.json({ success: true, message: "Refund status updated", data: updated }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update refund" },
                { status: 500 }
            );
        }
    }

    async getDiscounts(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const status = searchParams.get("status");

            const query: Record<string, any> = {};
            if (status) query.status = status;

            const discounts = await this.financeService.getDiscounts(query);
            return NextResponse.json({ success: true, count: discounts.length, data: discounts }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch discounts" },
                { status: 500 }
            );
        }
    }

    async createDiscount(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const body = await request.json();

            if (!body.patientId || !body.category || body.discountAmount === undefined || !body.approvedBy || !body.reason) {
                return NextResponse.json(
                    { success: false, message: "Patient, category, discount amount, approving officer, and reason are required" },
                    { status: 400 }
                );
            }

            const discount = await this.financeService.createDiscount(body);
            return NextResponse.json({ success: true, message: "Concession voucher created", data: discount }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create discount" },
                { status: 500 }
            );
        }
    }

    async updateDiscountStatus(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();
            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json({ success: false, message: "Invalid discount ID" }, { status: 400 });
            }

            const body = await request.json();
            const { status, notes } = body;

            if (!status) {
                return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 });
            }

            const updated = await this.financeService.updateDiscountStatus(id, status, notes);
            return NextResponse.json({ success: true, message: "Concession status updated", data: updated }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update concession" },
                { status: 500 }
            );
        }
    }

    async getCreditNotes(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const status = searchParams.get("status");

            const query: Record<string, any> = {};
            if (status) query.status = status;

            const creditNotes = await this.financeService.getCreditNotes(query);
            return NextResponse.json({ success: true, count: creditNotes.length, data: creditNotes }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch credit notes" },
                { status: 500 }
            );
        }
    }

    async createCreditNote(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const body = await request.json();

            if (!body.invoiceId || !body.patientId || body.amount === undefined || !body.description) {
                return NextResponse.json(
                    { success: false, message: "Invoice, patient, amount, and description are required" },
                    { status: 400 }
                );
            }

            const creditNote = await this.financeService.createCreditNote(body);
            return NextResponse.json({ success: true, message: "Credit Note issued", data: creditNote }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to issue credit note" },
                { status: 500 }
            );
        }
    }

    async updateCreditNoteStatus(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();
            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json({ success: false, message: "Invalid credit note ID" }, { status: 400 });
            }

            const body = await request.json();
            const { status, notes } = body;

            if (!status) {
                return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 });
            }

            const updated = await this.financeService.updateCreditNoteStatus(id, status, notes);
            return NextResponse.json({ success: true, message: "Credit note status updated", data: updated }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update credit note" },
                { status: 500 }
            );
        }
    }

    async getOutstanding(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data = await this.financeService.getOutstandingDues();
            return NextResponse.json({ success: true, data }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch outstanding dues" },
                { status: 500 }
            );
        }
    }

    async getReports(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const reportType = searchParams.get("type") || "all";

            const reports = await this.financeService.getFinancialReports(reportType);
            return NextResponse.json({ success: true, data: reports }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to generate financial reports" },
                { status: 500 }
            );
        }
    }
}

export default new FinanceController();
