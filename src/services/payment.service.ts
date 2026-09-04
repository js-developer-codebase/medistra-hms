import { Types } from "mongoose";
import PaymentModel from "@/models/payment.model";
import InvoiceModel from "@/models/invoice.model";
import { IPayment } from "@/interfaces/payment.interface";
import { CreatePaymentDto, UpdatePaymentDto } from "@/dto/payment.dto";

export class PaymentService {
    async createPayment(data: CreatePaymentDto): Promise<IPayment> {
        if (!data.receiptNumber) {
            const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            data.receiptNumber = `REC-${dateStr}-${randomCode}`;
        }

        const payment = new PaymentModel(data);
        const savedPayment = await payment.save();

        // Automatically update the associated Invoice
        if (data.invoiceId) {
            try {
                const invoice = await InvoiceModel.findById(data.invoiceId);
                if (invoice) {
                    const currentPaid = Number(invoice.paidAmount || 0);
                    const newPaid = currentPaid + Number(data.amount || 0);
                    const finalAmt = Number(invoice.finalAmount || 0);
                    const newBalance = Math.max(0, finalAmt - newPaid);
                    const newStatus = newBalance <= 0 ? "PAID" : "PARTIALLY_PAID";

                    invoice.paidAmount = newPaid;
                    invoice.balanceAmount = newBalance;
                    invoice.status = newStatus;
                    if (data.method) {
                        invoice.paymentMethod = data.method;
                    }
                    await invoice.save();
                }
            } catch (err) {
                console.error("Failed to update invoice balance on payment creation:", err);
            }
        }

        return savedPayment;
    }

    async getPaymentById(id: Types.ObjectId): Promise<IPayment | null> {
        return await PaymentModel.findById(id).populate("patientId").populate("invoiceId");
    }

    async getAllPayments(): Promise<IPayment[]> {
        return await PaymentModel.find().populate("patientId").populate("invoiceId").sort({ createdAt: -1 });
    }

    async getPaymentsByInvoiceId(invoiceId: Types.ObjectId): Promise<IPayment[]> {
        return await PaymentModel.find({ invoiceId }).populate("patientId").populate("invoiceId").sort({ createdAt: -1 });
    }

    async getPaymentsByBranchId(branchId: Types.ObjectId): Promise<IPayment[]> {
        return await PaymentModel.find({ branchId }).populate("patientId").populate("invoiceId").sort({ createdAt: -1 });
    }

    async updatePayment(id: Types.ObjectId, data: UpdatePaymentDto): Promise<IPayment | null> {
        return await PaymentModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deletePayment(id: Types.ObjectId): Promise<IPayment | null> {
        return await PaymentModel.findByIdAndDelete(id);
    }
}

export default new PaymentService();
