import { Types } from "mongoose";
import PaymentModel from "@/models/payment.model";
import { IPayment } from "@/interfaces/payment.interface";
import { CreatePaymentDto, UpdatePaymentDto } from "@/dto/payment.dto";

export class PaymentService {
    async createPayment(data: CreatePaymentDto): Promise<IPayment> {
        const payment = new PaymentModel(data);
        return await payment.save();
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
