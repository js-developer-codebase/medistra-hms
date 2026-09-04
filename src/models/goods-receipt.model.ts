import { Schema, model, models, Document, Types } from "mongoose";

export interface IGoodsReceiptItem {
  itemId?: Types.ObjectId;
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitPrice: number;
  batchNumber?: string;
  expiryDate?: Date;
  rejectionReason?: string;
}

export interface IGoodsReceipt extends Document {
  grnNumber: string;
  poNumber: string;
  poId?: Types.ObjectId;
  supplierName: string;
  deliveryChallanNumber?: string;
  deliveryDate: Date;
  items: IGoodsReceiptItem[];
  totalAcceptedValue: number;
  inspectedBy: string;
  qcStatus: "PASSED" | "CONDITIONAL" | "FAILED";
  warehouseLocation: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const goodsReceiptItemSchema = new Schema<IGoodsReceiptItem>({
  itemId: { type: Schema.Types.ObjectId, ref: "InventoryItem" },
  itemName: { type: String, required: true },
  orderedQuantity: { type: Number, required: true },
  receivedQuantity: { type: Number, required: true },
  acceptedQuantity: { type: Number, required: true },
  rejectedQuantity: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  rejectionReason: { type: String }
});

const goodsReceiptSchema = new Schema<IGoodsReceipt>(
  {
    grnNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    poNumber: { type: String, required: true, uppercase: true, trim: true },
    poId: { type: Schema.Types.ObjectId, ref: "PurchaseOrder" },
    supplierName: { type: String, required: true },
    deliveryChallanNumber: { type: String },
    deliveryDate: { type: Date, default: Date.now },
    items: [goodsReceiptItemSchema],
    totalAcceptedValue: { type: Number, default: 0 },
    inspectedBy: { type: String, default: "Procurement QC Officer" },
    qcStatus: {
      type: String,
      enum: ["PASSED", "CONDITIONAL", "FAILED"],
      default: "PASSED"
    },
    warehouseLocation: { type: String, default: "Central Warehouse - Receiving Bay" },
    notes: { type: String }
  },
  { timestamps: true }
);

const GoodsReceipt =
  models.GoodsReceipt || model<IGoodsReceipt>("GoodsReceipt", goodsReceiptSchema);

export default GoodsReceipt;
