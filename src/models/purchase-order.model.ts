import { Schema, model, models } from "mongoose";
import { IPurchaseOrder } from "@/interfaces/purchase-order.interface";

const purchaseOrderItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: "InventoryItem" },
  itemName: { type: String },
  itemCode: { type: String },
  uom: { type: String, default: "Units" },
  quantity: { type: Number, required: true, min: 1 },
  receivedQuantity: { type: Number, default: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 }
});

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "ProcurementSupplier" },
    supplierName: { type: String, required: true },
    supplierEmail: { type: String },
    supplierPhone: { type: String },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    paymentTerms: { type: String, default: "NET_30" },
    subTotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    prReference: { type: String },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "COMPLETED", "CANCELLED"],
      default: "DRAFT"
    },
    deliveryStatus: {
      type: String,
      enum: ["PENDING", "PARTIALLY_DELIVERED", "DELIVERED"],
      default: "PENDING"
    },
    approvedBy: { type: String },
    approvalDate: { type: Date },
    items: [purchaseOrderItemSchema],
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const PurchaseOrder =
  models.PurchaseOrder || model<IPurchaseOrder>("PurchaseOrder", purchaseOrderSchema);

export default PurchaseOrder;
