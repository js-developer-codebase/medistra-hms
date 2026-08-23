import invoiceRepository, { InvoiceRepository } from "@/repositories/invoice.repository";
import { Types } from "mongoose";
import { IInvoice } from "@/interfaces/invoice.interface";
import { CreateInvoiceDto, UpdateInvoiceDto } from "@/dto/invoice.dto";

export class InvoiceService {
    constructor(private repository: InvoiceRepository = invoiceRepository) { }

    async createInvoice(data: CreateInvoiceDto): Promise<IInvoice> {
        return await this.repository.create(data);
    }

    async getAllInvoices(): Promise<IInvoice[]> {
        return await this.repository.findAll();
    }

    async getInvoiceById(id: Types.ObjectId): Promise<IInvoice | null> {
        return await this.repository.findById(id);
    }

    async getInvoicesByBranchId(branchId: Types.ObjectId): Promise<IInvoice[]> {
        return await this.repository.findByBranchId(branchId);
    }
    
    async getInvoicesByPatientId(patientId: Types.ObjectId): Promise<IInvoice[]> {
        return await this.repository.findByPatientId(patientId);
    }

    async updateInvoice(id: Types.ObjectId, data: UpdateInvoiceDto): Promise<IInvoice | null> {
        const invoice = await this.repository.findById(id);
        if (!invoice) {
            throw { statusCode: 404, message: "Invoice not found" };
        }
        return await this.repository.update(id, data);
    }

    async deleteInvoice(id: Types.ObjectId): Promise<IInvoice | null> {
        const invoice = await this.repository.findById(id);
        if (!invoice) {
            throw { statusCode: 404, message: "Invoice not found" };
        }
        return await this.repository.delete(id);
    }
}

export default new InvoiceService();
