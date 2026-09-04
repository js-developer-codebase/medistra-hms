import { Types } from "mongoose";
import InvoiceModel from "@/models/invoice.model";
import PaymentModel from "@/models/payment.model";
import PatientRefundModel from "@/models/patient-refund.model";
import DiscountConcessionModel from "@/models/discount-concession.model";
import CreditNoteModel from "@/models/credit-note.model";
import "@/models/patient.model"; // Ensure Patient model is registered for populate

export class FinanceService {
    async getFinanceStats() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Fetch Invoices
        const invoices = await InvoiceModel.find({ status: { $ne: "CANCELLED" } }).lean();
        
        let totalInvoiced = 0;
        let totalOutstanding = 0;
        let paidCount = 0;
        let unpaidCount = 0;
        let partialCount = 0;
        const departmentMap: Record<string, number> = {};

        for (const inv of invoices) {
            const finalAmt = Number(inv.finalAmount || 0);
            const paidAmt = Number(inv.paidAmount || (inv.status === "PAID" ? finalAmt : 0));
            const balanceAmt = Number(inv.balanceAmount ?? (finalAmt - paidAmt));

            totalInvoiced += finalAmt;

            if (inv.status === "PAID") {
                paidCount++;
            } else if (inv.status === "PARTIALLY_PAID") {
                partialCount++;
                totalOutstanding += balanceAmt;
            } else {
                unpaidCount++;
                totalOutstanding += balanceAmt;
            }

            const dept = inv.department || "General";
            departmentMap[dept] = (departmentMap[dept] || 0) + finalAmt;
        }

        // Fetch Payments
        const payments = await PaymentModel.find().lean();
        let totalCollected = 0;
        let todayCollections = 0;
        const methodMap: Record<string, number> = {
            CASH: 0,
            CARD: 0,
            UPI: 0,
            BANK_TRANSFER: 0,
            CHEQUE: 0,
            INSURANCE_TPA: 0
        };

        for (const pay of payments) {
            const amt = Number(pay.amount || 0);
            totalCollected += amt;

            const payDate = pay.date ? new Date(pay.date) : new Date((pay as any).createdAt);
            if (payDate >= todayStart) {
                todayCollections += amt;
            }

            const m = pay.method || "CASH";
            methodMap[m] = (methodMap[m] || 0) + amt;
        }

        // Fetch Refunds
        const refunds = await PatientRefundModel.find().lean();
        let totalRefunds = 0;
        let pendingRefundsCount = 0;
        for (const ref of refunds) {
            if (ref.status === "PROCESSED" || ref.status === "APPROVED") {
                totalRefunds += Number(ref.amount || 0);
            }
            if (ref.status === "PENDING") {
                pendingRefundsCount++;
            }
        }

        // Fetch Concessions
        const concessions = await DiscountConcessionModel.find().lean();
        let totalConcessions = 0;
        let pendingConcessionsCount = 0;
        for (const conc of concessions) {
            if (conc.status === "APPROVED" || conc.status === "APPLIED") {
                totalConcessions += Number(conc.discountAmount || 0);
            }
            if (conc.status === "PENDING") {
                pendingConcessionsCount++;
            }
        }

        // Fetch Credit Notes
        const creditNotes = await CreditNoteModel.find().lean();
        let totalCreditNotes = 0;
        for (const cn of creditNotes) {
            if (cn.status !== "CANCELLED") {
                totalCreditNotes += Number(cn.amount || 0);
            }
        }

        // Recent Transactions (latest 6)
        const recentPayments = await PaymentModel.find()
            .populate("patientId", "name uhid contact")
            .populate("invoiceId", "invoiceNumber finalAmount department")
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();

        return {
            totalInvoiced,
            totalCollected,
            totalOutstanding,
            totalRefunds,
            totalConcessions,
            totalCreditNotes,
            netRevenue: totalCollected - totalRefunds,
            todayCollections,
            counts: {
                totalInvoices: invoices.length,
                paid: paidCount,
                unpaid: unpaidCount,
                partiallyPaid: partialCount,
                pendingRefunds: pendingRefundsCount,
                pendingConcessions: pendingConcessionsCount,
                creditNotesCount: creditNotes.length
            },
            departmentRevenue: departmentMap,
            paymentModeDistribution: methodMap,
            recentPayments
        };
    }

    async getReceipts(query: Record<string, any> = {}) {
        return await PaymentModel.find(query)
            .populate("patientId", "name uhid age gender contact address bloodGroup")
            .populate("invoiceId", "invoiceNumber items totalAmount discount taxAmount finalAmount department status createdAt")
            .sort({ createdAt: -1 })
            .lean();
    }

    async getRefunds(query: Record<string, any> = {}) {
        return await PatientRefundModel.find(query)
            .populate("patientId", "name uhid contact")
            .populate("invoiceId", "invoiceNumber finalAmount department")
            .sort({ createdAt: -1 })
            .lean();
    }

    async createRefund(data: any) {
        if (!data.refundNumber) {
            const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            data.refundNumber = `REF-${dateStr}-${randomCode}`;
        }
        const refund = new PatientRefundModel(data);
        return await refund.save();
    }

    async updateRefundStatus(id: string, status: string, approvedBy?: string, notes?: string) {
        const updateData: any = { status };
        if (approvedBy) updateData.approvedBy = approvedBy;
        if (notes) updateData.notes = notes;
        if (status === "PROCESSED") {
            updateData.processedAt = new Date();
        }
        return await PatientRefundModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async getDiscounts(query: Record<string, any> = {}) {
        return await DiscountConcessionModel.find(query)
            .populate("patientId", "name uhid contact bloodGroup")
            .populate("invoiceId", "invoiceNumber finalAmount department")
            .sort({ createdAt: -1 })
            .lean();
    }

    async createDiscount(data: any) {
        if (!data.concessionNumber) {
            const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            data.concessionNumber = `DISC-${dateStr}-${randomCode}`;
        }
        const discount = new DiscountConcessionModel(data);
        return await discount.save();
    }

    async updateDiscountStatus(id: string, status: string, notes?: string) {
        const updateData: any = { status };
        if (notes) updateData.notes = notes;
        return await DiscountConcessionModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async getCreditNotes(query: Record<string, any> = {}) {
        return await CreditNoteModel.find(query)
            .populate("patientId", "name uhid contact")
            .populate("invoiceId", "invoiceNumber finalAmount department items")
            .sort({ createdAt: -1 })
            .lean();
    }

    async createCreditNote(data: any) {
        if (!data.creditNoteNumber) {
            const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            data.creditNoteNumber = `CN-${dateStr}-${randomCode}`;
        }
        const creditNote = new CreditNoteModel(data);
        return await creditNote.save();
    }

    async updateCreditNoteStatus(id: string, status: string, notes?: string) {
        const updateData: any = { status };
        if (notes) updateData.notes = notes;
        return await CreditNoteModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async getOutstandingDues() {
        const unpaidInvoices = await InvoiceModel.find({
            status: { $in: ["UNPAID", "PARTIALLY_PAID"] }
        })
            .populate("patientId", "name uhid contact address")
            .sort({ createdAt: 1 })
            .lean();

        const now = new Date().getTime();
        const bucket0To30: any[] = [];
        const bucket31To60: any[] = [];
        const bucket61To90: any[] = [];
        const bucketOver90: any[] = [];

        let total0To30 = 0;
        let total31To60 = 0;
        let total61To90 = 0;
        let totalOver90 = 0;
        let grandTotalOutstanding = 0;

        for (const inv of unpaidInvoices) {
            const finalAmt = Number(inv.finalAmount || 0);
            const paidAmt = Number(inv.paidAmount || 0);
            const balance = Number(inv.balanceAmount ?? (finalAmt - paidAmt));

            if (balance <= 0) continue;

            grandTotalOutstanding += balance;

            const createdTime = new Date((inv as any).createdAt).getTime();
            const ageDays = Math.floor((now - createdTime) / (1000 * 60 * 60 * 24));
            const enriched = { ...inv, calculatedBalance: balance, ageDays };

            if (ageDays <= 30) {
                bucket0To30.push(enriched);
                total0To30 += balance;
            } else if (ageDays <= 60) {
                bucket31To60.push(enriched);
                total31To60 += balance;
            } else if (ageDays <= 90) {
                bucket61To90.push(enriched);
                total61To90 += balance;
            } else {
                bucketOver90.push(enriched);
                totalOver90 += balance;
            }
        }

        return {
            grandTotalOutstanding,
            buckets: {
                bucket0To30: { items: bucket0To30, total: total0To30, count: bucket0To30.length },
                bucket31To60: { items: bucket31To60, total: total31To60, count: bucket31To60.length },
                bucket61To90: { items: bucket61To90, total: total61To90, count: bucket61To90.length },
                bucketOver90: { items: bucketOver90, total: totalOver90, count: bucketOver90.length }
            },
            allOutstanding: [...bucketOver90, ...bucket61To90, ...bucket31To60, ...bucket0To30]
        };
    }

    async getFinancialReports(reportType: string = "all") {
        const invoices = await InvoiceModel.find({ status: { $ne: "CANCELLED" } })
            .populate("patientId", "name uhid")
            .sort({ createdAt: -1 })
            .lean();

        const payments = await PaymentModel.find()
            .populate("patientId", "name uhid")
            .populate("invoiceId", "invoiceNumber department")
            .sort({ createdAt: -1 })
            .lean();

        const refunds = await PatientRefundModel.find({ status: { $in: ["APPROVED", "PROCESSED"] } })
            .populate("patientId", "name uhid")
            .sort({ createdAt: -1 })
            .lean();

        const discounts = await DiscountConcessionModel.find({ status: { $in: ["APPROVED", "APPLIED"] } })
            .populate("patientId", "name uhid")
            .sort({ createdAt: -1 })
            .lean();

        // 1. Daily Collections Register (Group by date)
        const dailyRegisterMap: Record<string, { date: string; cash: number; digital: number; total: number; count: number }> = {};
        for (const p of payments) {
            const dateKey = (p.date ? new Date(p.date) : new Date((p as any).createdAt)).toISOString().slice(0, 10);
            if (!dailyRegisterMap[dateKey]) {
                dailyRegisterMap[dateKey] = { date: dateKey, cash: 0, digital: 0, total: 0, count: 0 };
            }
            const amt = Number(p.amount || 0);
            dailyRegisterMap[dateKey].total += amt;
            dailyRegisterMap[dateKey].count += 1;
            if (p.method === "CASH") {
                dailyRegisterMap[dateKey].cash += amt;
            } else {
                dailyRegisterMap[dateKey].digital += amt;
            }
        }
        const dailyRegister = Object.values(dailyRegisterMap).sort((a, b) => b.date.localeCompare(a.date));

        // 2. Departmental Revenue Statement
        const departmentRevenueMap: Record<string, { department: string; invoicesCount: number; grossAmount: number; discount: number; netRevenue: number }> = {};
        for (const inv of invoices) {
            const dept = inv.department || "General";
            if (!departmentRevenueMap[dept]) {
                departmentRevenueMap[dept] = { department: dept, invoicesCount: 0, grossAmount: 0, discount: 0, netRevenue: 0 };
            }
            departmentRevenueMap[dept].invoicesCount += 1;
            departmentRevenueMap[dept].grossAmount += Number(inv.totalAmount || 0);
            departmentRevenueMap[dept].discount += Number(inv.discount || 0);
            departmentRevenueMap[dept].netRevenue += Number(inv.finalAmount || 0);
        }
        const departmentRevenue = Object.values(departmentRevenueMap).sort((a, b) => b.netRevenue - a.netRevenue);

        // 3. Tax / GST Report
        let totalTaxableValue = 0;
        let totalGstCollected = 0;
        for (const inv of invoices) {
            const tax = Number(inv.taxAmount || 0);
            const total = Number(inv.finalAmount || 0);
            totalGstCollected += tax;
            totalTaxableValue += (total - tax);
        }
        const gstStatement = {
            totalTaxableValue,
            totalGstCollected,
            cgst: totalGstCollected / 2,
            sgst: totalGstCollected / 2,
            effectiveRate: totalTaxableValue > 0 ? ((totalGstCollected / totalTaxableValue) * 100).toFixed(1) + "%" : "0%"
        };

        // 4. Concessions & Refunds Audit
        const totalConcessionsAmount = discounts.reduce((sum, d) => sum + Number(d.discountAmount || 0), 0);
        const totalRefundsAmount = refunds.reduce((sum, r) => sum + Number(r.amount || 0), 0);

        return {
            dailyRegister,
            departmentRevenue,
            gstStatement,
            auditSummary: {
                totalConcessionsAmount,
                concessionsCount: discounts.length,
                totalRefundsAmount,
                refundsCount: refunds.length,
                discounts,
                refunds
            }
        };
    }
}

export default new FinanceService();
