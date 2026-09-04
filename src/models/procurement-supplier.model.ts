import { Schema, model, models, Document } from "mongoose";

export interface IProcurementSupplier extends Document {
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  gstin?: string;
  panNumber?: string;
  paymentTerms: "ADVANCE" | "NET_15" | "NET_30" | "NET_45" | "NET_60" | "COD";
  leadTimeDays: number;
  categoriesSupplied: string[];
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  rating: number;
  status: "ACTIVE" | "INACTIVE" | "BLACKLISTED";
  createdAt?: Date;
  updatedAt?: Date;
}

const procurementSupplierSchema = new Schema<IProcurementSupplier>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    address: { type: String },
    gstin: { type: String, uppercase: true, trim: true },
    panNumber: { type: String, uppercase: true, trim: true },
    paymentTerms: {
      type: String,
      enum: ["ADVANCE", "NET_15", "NET_30", "NET_45", "NET_60", "COD"],
      default: "NET_30"
    },
    leadTimeDays: { type: Number, default: 5 },
    categoriesSupplied: [{ type: String }],
    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String }
    },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLACKLISTED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

const ProcurementSupplier =
  models.ProcurementSupplier ||
  model<IProcurementSupplier>("ProcurementSupplier", procurementSupplierSchema);

export default ProcurementSupplier;
