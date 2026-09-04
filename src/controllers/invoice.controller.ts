import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultInvoiceService, { InvoiceService } from "@/services/invoice.service";
import { CreateInvoiceDto, UpdateInvoiceDto } from "@/dto/invoice.dto";

export class InvoiceController {
    constructor(private invoiceService: InvoiceService = defaultInvoiceService) { }

    async createInvoice(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateInvoiceDto = await request.json();

            if (!data.patientId || !data.items || !Array.isArray(data.items) || data.totalAmount === undefined || data.discount === undefined || data.finalAmount === undefined) {
                return NextResponse.json(
                    { success: false, message: "Required fields are missing: patientId, items, totalAmount, discount, finalAmount" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.patientId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid ID format for patient" },
                    { status: 400 }
                );
            }

            if (data.branchId && !Types.ObjectId.isValid(data.branchId)) {
                delete (data as any).branchId;
            }

            if (!data.invoiceNumber) {
                const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
                const randomCode = Math.floor(1000 + Math.random() * 9000);
                data.invoiceNumber = `INV-${dateStr}-${randomCode}`;
            }

            if (data.paidAmount === undefined) {
                data.paidAmount = data.status === "PAID" ? data.finalAmount : 0;
            }
            if (data.balanceAmount === undefined) {
                data.balanceAmount = Math.max(0, data.finalAmount - data.paidAmount);
            }

            const invoice = await this.invoiceService.createInvoice(data);

            return NextResponse.json(
                { success: true, message: "Invoice created successfully", data: invoice },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create invoice" },
                { status: statusCode }
            );
        }
    }

    async getInvoices(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();

            const { searchParams } = new URL(request.url);
            const branchId = searchParams.get('branchId');
            const patientId = searchParams.get('patientId');

            let invoices;

            if (branchId) {
                if (!Types.ObjectId.isValid(branchId)) return NextResponse.json({ success: false, message: "Invalid branch ID" }, { status: 400 });
                invoices = await this.invoiceService.getInvoicesByBranchId(new Types.ObjectId(branchId));
            } else if (patientId) {
                if (!Types.ObjectId.isValid(patientId)) return NextResponse.json({ success: false, message: "Invalid patient ID" }, { status: 400 });
                invoices = await this.invoiceService.getInvoicesByPatientId(new Types.ObjectId(patientId));
            } else {
                invoices = await this.invoiceService.getAllInvoices();
            }

            return NextResponse.json(
                { success: true, count: invoices.length, data: invoices },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch invoices" },
                { status: 500 }
            );
        }
    }

    async getInvoiceById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid invoice ID" },
                    { status: 400 }
                );
            }

            const invoice = await this.invoiceService.getInvoiceById(new Types.ObjectId(id));
            if (!invoice) {
                return NextResponse.json(
                    { success: false, message: "Invoice not found" },
                    { status: 440 }
                );
            }

            return NextResponse.json(
                { success: true, data: invoice },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch invoice" },
                { status: 500 }
            );
        }
    }

    async updateInvoice(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid invoice ID" },
                    { status: 400 }
                );
            }

            const data: UpdateInvoiceDto = await request.json();

            if (data.patientId && !Types.ObjectId.isValid(data.patientId)) {
                return NextResponse.json({ success: false, message: "Invalid patient ID format" }, { status: 400 });
            }
            if (data.branchId && !Types.ObjectId.isValid(data.branchId)) {
                return NextResponse.json({ success: false, message: "Invalid branch ID format" }, { status: 400 });
            }

            const invoice = await this.invoiceService.updateInvoice(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "Invoice updated successfully", data: invoice },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update invoice" },
                { status: statusCode }
            );
        }
    }

    async deleteInvoice(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid invoice ID" },
                    { status: 400 }
                );
            }

            await this.invoiceService.deleteInvoice(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Invoice deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete invoice" },
                { status: statusCode }
            );
        }
    }
}

export default new InvoiceController();
