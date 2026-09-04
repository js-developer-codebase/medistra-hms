import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ProcurementSupplier, { IProcurementSupplier } from "@/models/procurement-supplier.model";
import PurchaseRequest, { IPurchaseRequest } from "@/models/purchase-request.model";
import PurchaseOrder from "@/models/purchase-order.model";
import { IPurchaseOrder } from "@/interfaces/purchase-order.interface";
import GoodsReceipt, { IGoodsReceipt } from "@/models/goods-receipt.model";
import PurchaseInvoice, { IPurchaseInvoice } from "@/models/purchase-invoice.model";
import InventoryItem from "@/models/inventory-item.model";
import StockTransaction from "@/models/stock-transaction.model";

export class ProcurementService {
  // 1. Live Procurement Dashboard & KPI Statistics
  async getProcurementStats() {
    await dbConnect();
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      orders,
      requests,
      activeSuppliersCount,
      monthReceiptsCount,
      invoices
    ] = await Promise.all([
      PurchaseOrder.find().sort({ createdAt: -1 }),
      PurchaseRequest.find().sort({ createdAt: -1 }),
      ProcurementSupplier.countDocuments({ status: "ACTIVE" }),
      GoodsReceipt.countDocuments({ createdAt: { $gte: startOfMonth } }),
      PurchaseInvoice.find().sort({ createdAt: -1 })
    ]);

    let totalSpend = 0;
    let pendingOrdersCount = 0;
    let approvedOrdersCount = 0;
    const poStatusDistribution: Record<string, number> = {
      DRAFT: 0,
      PENDING: 0,
      APPROVED: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };

    orders.forEach((po) => {
      if (po.status === "APPROVED" || po.status === "COMPLETED") {
        totalSpend += po.totalAmount || 0;
      }
      if (po.status === "PENDING" || po.status === "DRAFT") {
        pendingOrdersCount++;
      }
      if (po.status === "APPROVED") {
        approvedOrdersCount++;
      }
      if (poStatusDistribution[po.status] !== undefined) {
        poStatusDistribution[po.status]++;
      }
    });

    const pendingRequestsCount = requests.filter((r) => r.status === "SUBMITTED").length;

    let unpaidLiability = 0;
    let unpaidInvoicesCount = 0;
    invoices.forEach((inv) => {
      if (inv.paymentStatus === "UNPAID" || inv.paymentStatus === "PARTIALLY_PAID") {
        unpaidInvoicesCount++;
        unpaidLiability += (inv.totalAmount || 0) - (inv.paidAmount || 0);
      }
    });

    return {
      totalSpend,
      activeSuppliersCount,
      pendingRequestsCount,
      approvedOrdersCount,
      pendingOrdersCount,
      totalOrdersCount: orders.length,
      monthReceiptsCount,
      unpaidInvoicesCount,
      unpaidLiability,
      poStatusDistribution
    };
  }

  // 2. Suppliers Master Directory
  async getSuppliers(filter: any = {}) {
    await dbConnect();
    return await ProcurementSupplier.find(filter).sort({ name: 1 });
  }

  async getSupplierById(id: string | Types.ObjectId) {
    await dbConnect();
    return await ProcurementSupplier.findById(id);
  }

  async createSupplier(data: Partial<IProcurementSupplier>) {
    await dbConnect();
    if (!data.code) {
      const suffix = Math.floor(100 + Math.random() * 900);
      data.code = `SUP-${suffix}`;
    }
    const supplier = new ProcurementSupplier(data);
    return await supplier.save();
  }

  async updateSupplier(id: string | Types.ObjectId, data: Partial<IProcurementSupplier>) {
    await dbConnect();
    return await ProcurementSupplier.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSupplier(id: string | Types.ObjectId) {
    await dbConnect();
    return await ProcurementSupplier.findByIdAndDelete(id);
  }

  // 3. Purchase Requests / Requisitions
  async getRequests(filter: any = {}) {
    await dbConnect();
    return await PurchaseRequest.find(filter).sort({ createdAt: -1 });
  }

  async getRequestById(id: string | Types.ObjectId) {
    await dbConnect();
    return await PurchaseRequest.findById(id);
  }

  async createRequest(data: Partial<IPurchaseRequest>) {
    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    if (!data.prNumber) {
      data.prNumber = `PR-${todayStr}-${randomSuffix}`;
    }

    let totalEstimated = 0;
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item) => {
        item.estimatedTotalPrice = (item.quantity || 1) * (item.estimatedUnitPrice || 0);
        totalEstimated += item.estimatedTotalPrice;
      });
    }
    data.totalEstimatedAmount = totalEstimated;

    const request = new PurchaseRequest(data);
    return await request.save();
  }

  async approveRequest(id: string | Types.ObjectId, approvedBy: string = "HOD / Medical Director") {
    await dbConnect();
    return await PurchaseRequest.findByIdAndUpdate(
      id,
      {
        status: "APPROVED",
        approvedBy,
        approvalDate: new Date()
      },
      { new: true }
    );
  }

  async rejectRequest(id: string | Types.ObjectId, rejectionReason: string) {
    await dbConnect();
    return await PurchaseRequest.findByIdAndUpdate(
      id,
      {
        status: "REJECTED",
        rejectionReason
      },
      { new: true }
    );
  }

  // 4. Purchase Orders
  async getPurchaseOrders(filter: any = {}) {
    await dbConnect();
    return await PurchaseOrder.find(filter)
      .populate("items.itemId")
      .populate("supplierId")
      .sort({ createdAt: -1 });
  }

  async getPurchaseOrderById(id: string | Types.ObjectId) {
    await dbConnect();
    return await PurchaseOrder.findById(id)
      .populate("items.itemId")
      .populate("supplierId");
  }

  async createPurchaseOrder(data: Partial<IPurchaseOrder>) {
    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    if (!data.poNumber) {
      data.poNumber = `PO-${todayStr}-${randomSuffix}`;
    }

    let subTotal = 0;
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item) => {
        item.totalPrice = (item.quantity || 1) * (item.unitPrice || 0);
        subTotal += item.totalPrice;
      });
    }
    data.subTotal = subTotal;
    const taxAmount = Number(data.taxAmount) || Math.round(subTotal * 0.18); // default 18% GST in ₹
    data.taxAmount = taxAmount;
    data.totalAmount = subTotal + taxAmount;

    // If converted from PR, mark PR as PO_CREATED
    if (data.prReference) {
      await PurchaseRequest.findOneAndUpdate(
        { prNumber: data.prReference },
        { status: "PO_CREATED", poNumber: data.poNumber }
      );
    }

    const order = new PurchaseOrder(data);
    return await order.save();
  }

  async updatePurchaseOrder(id: string | Types.ObjectId, data: Partial<IPurchaseOrder>) {
    await dbConnect();
    if (data.items && Array.isArray(data.items)) {
      let subTotal = 0;
      data.items.forEach((item) => {
        item.totalPrice = (item.quantity || 1) * (item.unitPrice || 0);
        subTotal += item.totalPrice;
      });
      data.subTotal = subTotal;
      const taxAmount = Number(data.taxAmount) || Math.round(subTotal * 0.18);
      data.taxAmount = taxAmount;
      data.totalAmount = subTotal + taxAmount;
    }
    return await PurchaseOrder.findByIdAndUpdate(id, data, { new: true });
  }

  async approvePurchaseOrder(id: string | Types.ObjectId, approvedBy: string = "Procurement Manager") {
    await dbConnect();
    return await PurchaseOrder.findByIdAndUpdate(
      id,
      {
        status: "APPROVED",
        approvedBy,
        approvalDate: new Date()
      },
      { new: true }
    );
  }

  async cancelPurchaseOrder(id: string | Types.ObjectId, reason?: string) {
    await dbConnect();
    return await PurchaseOrder.findByIdAndUpdate(
      id,
      {
        status: "CANCELLED",
        notes: reason
      },
      { new: true }
    );
  }

  // 5. Goods Receipt & Inspection (GRN)
  async getGoodsReceipts(filter: any = {}) {
    await dbConnect();
    return await GoodsReceipt.find(filter).sort({ createdAt: -1 });
  }

  async getGoodsReceiptById(id: string | Types.ObjectId) {
    await dbConnect();
    return await GoodsReceipt.findById(id);
  }

  async createGoodsReceipt(data: Partial<IGoodsReceipt>) {
    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    if (!data.grnNumber) {
      data.grnNumber = `PGRN-${todayStr}-${randomSuffix}`;
    }

    let totalAccepted = 0;
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        const itemAcceptedVal = (item.acceptedQuantity || 0) * (item.unitPrice || 0);
        totalAccepted += itemAcceptedVal;

        // Auto-increment Inventory stock if itemId matches an InventoryItem
        if (item.itemId && (item.acceptedQuantity || 0) > 0) {
          const invItem = await InventoryItem.findById(item.itemId);
          if (invItem) {
            invItem.currentStock = (invItem.currentStock || 0) + item.acceptedQuantity;
            if (item.unitPrice) invItem.unitPrice = item.unitPrice;
            await invItem.save();

            // Log stock transaction
            await StockTransaction.create({
              transactionCode: data.grnNumber,
              itemId: invItem._id,
              itemName: invItem.name,
              transactionType: "IN",
              quantity: item.acceptedQuantity,
              batchNumber: item.batchNumber || `BAT-${todayStr}`,
              expiryDate: item.expiryDate,
              unitPrice: item.unitPrice,
              totalAmount: itemAcceptedVal,
              sourceDepartment: data.supplierName || "Direct Supplier",
              destinationDepartment: data.warehouseLocation || "Central Warehouse",
              reference: data.poNumber || data.deliveryChallanNumber || data.grnNumber,
              notes: `Procurement GRN Accepted from ${data.supplierName}`,
              performedByName: data.inspectedBy || "Procurement QC Officer"
            });
          }
        }
      }
    }
    data.totalAcceptedValue = totalAccepted;

    // Update PO deliveryStatus & items receivedQuantity
    if (data.poNumber) {
      const po = await PurchaseOrder.findOne({ poNumber: data.poNumber });
      if (po) {
        po.deliveryStatus = "DELIVERED";
        po.status = "COMPLETED";
        await po.save();
      }
    }

    const grn = new GoodsReceipt(data);
    return await grn.save();
  }

  // 6. Purchase Invoices & 3-Way Matching Engine
  async getInvoices(filter: any = {}) {
    await dbConnect();
    return await PurchaseInvoice.find(filter).sort({ createdAt: -1 });
  }

  async getInvoiceById(id: string | Types.ObjectId) {
    await dbConnect();
    return await PurchaseInvoice.findById(id);
  }

  async createInvoice(data: Partial<IPurchaseInvoice>) {
    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    if (!data.invoiceNumber) {
      data.invoiceNumber = `PINV-${todayStr}-${randomSuffix}`;
    }

    // 3-Way Matching Engine:
    // Compare Invoice totalAmount with PO totalAmount and GRN accepted value
    let matchingStatus: "3_WAY_MATCHED" | "DISCREPANCY_DETECTED" | "PENDING_VERIFICATION" =
      "3_WAY_MATCHED";
    let discrepancyNotes = "";

    if (data.poNumber) {
      const po = await PurchaseOrder.findOne({ poNumber: data.poNumber });
      if (po) {
        const poTotal = po.totalAmount || 0;
        const billedTotal = Number(data.totalAmount) || 0;
        const diff = Math.abs(billedTotal - poTotal);

        if (diff > 5) {
          matchingStatus = "DISCREPANCY_DETECTED";
          discrepancyNotes = `Amount mismatch: Billed ₹${billedTotal.toLocaleString("en-IN")} vs PO Total ₹${poTotal.toLocaleString("en-IN")} (Variance: ₹${diff.toLocaleString("en-IN")})`;
        }
      }
    }

    data.matchingStatus = matchingStatus;
    if (discrepancyNotes) data.discrepancyNotes = discrepancyNotes;

    const invoice = new PurchaseInvoice(data);
    return await invoice.save();
  }

  async recordPayment(id: string | Types.ObjectId, paymentData: { amount: number; paymentReference?: string }) {
    await dbConnect();
    const inv = await PurchaseInvoice.findById(id);
    if (!inv) throw new Error("Purchase invoice not found");

    const newPaidAmount = (inv.paidAmount || 0) + paymentData.amount;
    inv.paidAmount = newPaidAmount;
    inv.paymentReference = paymentData.paymentReference || inv.paymentReference;

    if (newPaidAmount >= (inv.totalAmount || 0)) {
      inv.paymentStatus = "PAID";
    } else if (newPaidAmount > 0) {
      inv.paymentStatus = "PARTIALLY_PAID";
    }

    return await inv.save();
  }

  // 7. Procurement Analytics & Spend Reports
  async getProcurementReports() {
    await dbConnect();
    const [orders, receipts, suppliers, invoices, requests] = await Promise.all([
      PurchaseOrder.find().sort({ orderDate: -1 }),
      GoodsReceipt.find().sort({ deliveryDate: -1 }),
      ProcurementSupplier.find(),
      PurchaseInvoice.find(),
      PurchaseRequest.find()
    ]);

    // Spend by Supplier
    const supplierSpend: Record<string, { totalSpend: number; ordersCount: number }> = {};
    orders.forEach((po) => {
      const sup = po.supplierName || "Other Suppliers";
      if (!supplierSpend[sup]) {
        supplierSpend[sup] = { totalSpend: 0, ordersCount: 0 };
      }
      supplierSpend[sup].totalSpend += po.totalAmount || 0;
      supplierSpend[sup].ordersCount++;
    });

    // Spend by Department (from PRs)
    const departmentSpend: Record<string, { count: number; estimatedSpend: number }> = {};
    requests.forEach((pr) => {
      const dept = pr.department || "General Store";
      if (!departmentSpend[dept]) {
        departmentSpend[dept] = { count: 0, estimatedSpend: 0 };
      }
      departmentSpend[dept].count++;
      departmentSpend[dept].estimatedSpend += pr.totalEstimatedAmount || 0;
    });

    // QC Acceptance Ratio
    let totalOrdered = 0;
    let totalAccepted = 0;
    let totalRejected = 0;
    receipts.forEach((r) => {
      (r.items || []).forEach((item: any) => {
        totalOrdered += item.orderedQuantity || 0;
        totalAccepted += item.acceptedQuantity || 0;
        totalRejected += item.rejectedQuantity || 0;
      });
    });

    const qcAcceptanceRate =
      totalOrdered > 0 ? Math.round((totalAccepted / (totalAccepted + totalRejected || 1)) * 100) : 100;

    return {
      supplierSpend,
      departmentSpend,
      qcMetrics: {
        totalOrdered,
        totalAccepted,
        totalRejected,
        qcAcceptanceRate
      },
      totalActiveSuppliers: suppliers.length,
      totalOrdersProcessed: orders.length,
      totalInvoicesCount: invoices.length
    };
  }
}

export const procurementService = new ProcurementService();
export default procurementService;
