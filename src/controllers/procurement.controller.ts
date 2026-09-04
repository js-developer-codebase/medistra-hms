import { NextRequest, NextResponse } from "next/server";
import { procurementService, ProcurementService } from "@/services/procurement.service";

export class ProcurementController {
  constructor(private svc: ProcurementService = procurementService) {}

  // 1. Stats
  async getStats(request: NextRequest): Promise<NextResponse> {
    try {
      const stats = await this.svc.getProcurementStats();
      return NextResponse.json({ success: true, data: stats });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 2. Suppliers
  async getSuppliers(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search");
      const status = searchParams.get("status");
      const filter: any = {};
      if (status && status !== "ALL") filter.status = status;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
          { contactPerson: { $regex: search, $options: "i" } }
        ];
      }

      const suppliers = await this.svc.getSuppliers(filter);
      return NextResponse.json({ success: true, data: suppliers });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getSupplierById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      const supplier = await this.svc.getSupplierById(params.id);
      if (!supplier) return NextResponse.json({ success: false, message: "Supplier not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: supplier });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async createSupplier(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const supplier = await this.svc.createSupplier(body);
      return NextResponse.json({ success: true, data: supplier }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateSupplier(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      const body = await request.json();
      const supplier = await this.svc.updateSupplier(params.id, body);
      return NextResponse.json({ success: true, data: supplier });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async deleteSupplier(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await this.svc.deleteSupplier(params.id);
      return NextResponse.json({ success: true, message: "Supplier deleted" });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 3. Purchase Requests
  async getRequests(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const department = searchParams.get("department");
      const status = searchParams.get("status");
      const filter: any = {};
      if (department && department !== "ALL") filter.department = department;
      if (status && status !== "ALL") filter.status = status;

      const requests = await this.svc.getRequests(filter);
      return NextResponse.json({ success: true, data: requests });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getRequestById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      const pr = await this.svc.getRequestById(params.id);
      if (!pr) return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: pr });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async createRequest(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const pr = await this.svc.createRequest(body);
      return NextResponse.json({ success: true, data: pr }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateRequest(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      const body = await request.json();
      if (body.action === "APPROVE") {
        const approved = await this.svc.approveRequest(params.id, body.approvedBy);
        return NextResponse.json({ success: true, data: approved });
      } else if (body.action === "REJECT") {
        const rejected = await this.svc.rejectRequest(params.id, body.rejectionReason);
        return NextResponse.json({ success: true, data: rejected });
      }
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 4. Purchase Orders
  async getPurchaseOrders(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const filter: any = {};
      if (status && status !== "ALL") filter.status = status;

      const orders = await this.svc.getPurchaseOrders(filter);
      return NextResponse.json(orders);
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getPurchaseOrderById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      const po = await this.svc.getPurchaseOrderById(params.id);
      if (!po) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: po });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async createPurchaseOrder(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const po = await this.svc.createPurchaseOrder(body);
      return NextResponse.json(po, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updatePurchaseOrder(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      const body = await request.json();
      if (body.action === "APPROVE") {
        const approved = await this.svc.approvePurchaseOrder(params.id, body.approvedBy);
        return NextResponse.json({ success: true, data: approved });
      } else if (body.action === "CANCEL") {
        const cancelled = await this.svc.cancelPurchaseOrder(params.id, body.reason);
        return NextResponse.json({ success: true, data: cancelled });
      }
      const updated = await this.svc.updatePurchaseOrder(params.id, body);
      return NextResponse.json({ success: true, data: updated });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 5. Goods Receipt (GRN)
  async getGoodsReceipts(request: NextRequest): Promise<NextResponse> {
    try {
      const receipts = await this.svc.getGoodsReceipts();
      return NextResponse.json({ success: true, data: receipts });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getGoodsReceiptById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      const receipt = await this.svc.getGoodsReceiptById(params.id);
      if (!receipt) return NextResponse.json({ success: false, message: "Receipt not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: receipt });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async createGoodsReceipt(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const grn = await this.svc.createGoodsReceipt(body);
      return NextResponse.json({ success: true, data: grn }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 6. Purchase Invoices & 3-Way Matching
  async getInvoices(request: NextRequest): Promise<NextResponse> {
    try {
      const invoices = await this.svc.getInvoices();
      return NextResponse.json({ success: true, data: invoices });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getInvoiceById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      const invoice = await this.svc.getInvoiceById(params.id);
      if (!invoice) return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: invoice });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async createInvoice(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const invoice = await this.svc.createInvoice(body);
      return NextResponse.json({ success: true, data: invoice }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateInvoice(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      const body = await request.json();
      if (body.action === "PAYMENT") {
        const paid = await this.svc.recordPayment(params.id, {
          amount: Number(body.amount),
          paymentReference: body.paymentReference
        });
        return NextResponse.json({ success: true, data: paid });
      }
      return NextResponse.json({ success: false, message: "Invalid invoice action" }, { status: 400 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 7. Reports
  async getReports(request: NextRequest): Promise<NextResponse> {
    try {
      const reports = await this.svc.getProcurementReports();
      return NextResponse.json({ success: true, data: reports });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }
}

export const procurementController = new ProcurementController();
export default procurementController;
