import { Schema, model, models, Document } from "mongoose";

export interface IPurchaseInvoice extends Document {
  invoiceNumber: string;
  vendorInvoiceRef: string;
  poNumber: string;
  grnNumber?: string;
  supplierName: string;
  invoiceDate: Date;
  dueDate?: Date;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  matchingStatus: "3_WAY_MATCHED" | "DISCREPANCY_DETECTED" | "PENDING_VERIFICATION";
  discrepancyNotes?: string;
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "HOLD";
  paidAmount: number;
  paymentReference?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const purchaseInvoiceSchema = new Schema<IPurchaseInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vendorInvoiceRef: { type: String, required: true, trim: true },
    poNumber: { type: String, required: true, uppercase: true, trim: true },
    grnNumber: { type: String, uppercase: true, trim: true },
    supplierName: { type: String, required: true },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    subTotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    matchingStatus: {
      type: String,
      enum: ["3_WAY_MATCHED", "DISCREPANCY_DETECTED", "PENDING_VERIFICATION"],
      default: "PENDING_VERIFICATION"
    },
    discrepancyNotes: { type: String },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PARTIALLY_PAID", "PAID", "HOLD"],
      default: "UNPAID"
    },
    paidAmount: { type: Number, default: 0 },
    paymentReference: { type: String },
    verifiedBy: { type: String, default: "Accounts Payable Officer" },
    notes: { type: String }
  },
  { timestamps: true }
);

const PurchaseInvoice =
  models.PurchaseInvoice ||
  model<IPurchaseInvoice>("PurchaseInvoice", purchaseInvoiceSchema);

export default PurchaseInvoice;
