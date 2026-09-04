import { Schema, model, models, Document, Types } from "mongoose";

export interface IPurchaseRequestItem {
  itemId?: Types.ObjectId;
  itemName: string;
  itemCode?: string;
  quantity: number;
  uom: string;
  estimatedUnitPrice: number;
  estimatedTotalPrice: number;
  clinicalJustification?: string;
}

export interface IPurchaseRequest extends Document {
  prNumber: string;
  department: string;
  requestedBy: string;
  requiredDate?: Date;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT_STAT";
  items: IPurchaseRequestItem[];
  totalEstimatedAmount: number;
  status: "SUBMITTED" | "APPROVED" | "PO_CREATED" | "REJECTED";
  approvedBy?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  poNumber?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const purchaseRequestItemSchema = new Schema<IPurchaseRequestItem>({
  itemId: { type: Schema.Types.ObjectId, ref: "InventoryItem" },
  itemName: { type: String, required: true },
  itemCode: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  uom: { type: String, default: "Units" },
  estimatedUnitPrice: { type: Number, default: 0 },
  estimatedTotalPrice: { type: Number, default: 0 },
  clinicalJustification: { type: String }
});

const purchaseRequestSchema = new Schema<IPurchaseRequest>(
  {
    prNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: String, required: true },
    requestedBy: { type: String, required: true },
    requiredDate: { type: Date },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT_STAT"],
      default: "MEDIUM"
    },
    items: [purchaseRequestItemSchema],
    totalEstimatedAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["SUBMITTED", "APPROVED", "PO_CREATED", "REJECTED"],
      default: "SUBMITTED"
    },
    approvedBy: { type: String },
    approvalDate: { type: Date },
    rejectionReason: { type: String },
    poNumber: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

const PurchaseRequest =
  models.PurchaseRequest ||
  model<IPurchaseRequest>("PurchaseRequest", purchaseRequestSchema);

export default PurchaseRequest;
