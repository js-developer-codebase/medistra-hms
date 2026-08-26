import PurchaseOrder from "@/models/purchase-order.model";
import { IPurchaseOrder } from "@/interfaces/purchase-order.interface";

export class ProcurementService {
    async getPurchaseOrders() {
        return await PurchaseOrder.find().populate('items.itemId').sort({ createdAt: -1 });
    }

    async getPurchaseOrderById(id: string) {
        return await PurchaseOrder.findById(id).populate('items.itemId');
    }

    async createPurchaseOrder(data: Partial<IPurchaseOrder>) {
        // Calculate total amount
        let totalAmount = 0;
        if (data.items) {
            data.items.forEach(item => {
                item.totalPrice = item.quantity * item.unitPrice;
                totalAmount += item.totalPrice;
            });
        }
        data.totalAmount = totalAmount;
        return await PurchaseOrder.create(data);
    }

    async updatePurchaseOrder(id: string, data: Partial<IPurchaseOrder>) {
        if (data.items) {
            let totalAmount = 0;
            data.items.forEach(item => {
                item.totalPrice = item.quantity * item.unitPrice;
                totalAmount += item.totalPrice;
            });
            data.totalAmount = totalAmount;
        }
        return await PurchaseOrder.findByIdAndUpdate(id, data, { new: true });
    }
}

export const procurementService = new ProcurementService();
