import { Schema, model } from "mongoose";
import { IPurchaseOrder } from "@/interfaces/purchase-order.interface";

const purchaseOrderSchema = new Schema<IPurchaseOrder>({
    poNumber: { type: String, required: true, unique: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Organization" }, // Assuming Organization or we need Supplier model. Let's not make it strict ref for now, or assume Organization.
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    status: { type: String, enum: ["DRAFT", "PENDING", "APPROVED", "COMPLETED", "CANCELLED"], default: "DRAFT" },
    items: [{
        itemId: { type: Schema.Types.ObjectId, ref: "InventoryItem", required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default model<IPurchaseOrder>("PurchaseOrder", purchaseOrderSchema);
