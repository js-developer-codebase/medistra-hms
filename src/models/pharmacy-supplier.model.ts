import { Schema, model, models } from "mongoose";

export interface IPharmacySupplier {
    name: string;
    code: string;
    contactPerson: string;
    phone: string;
    email: string;
    address?: string;
    gstin?: string;
    dlNumber?: string; // Drug License Number e.g. DL-20B/21B-XXXX
    paymentTerms: "ADVANCE" | "NET_15" | "NET_30" | "NET_60" | "COD";
    leadTimeDays: number;
    categoriesSupplied: string[];
    rating: number; // 1 to 5
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const pharmacySupplierSchema = new Schema<IPharmacySupplier>(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true, uppercase: true },
        contactPerson: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String },
        gstin: { type: String },
        dlNumber: { type: String },
        paymentTerms: {
            type: String,
            enum: ["ADVANCE", "NET_15", "NET_30", "NET_60", "COD"],
            default: "NET_30"
        },
        leadTimeDays: { type: Number, default: 3 },
        categoriesSupplied: [{ type: String }],
        rating: { type: Number, default: 4.8 },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const PharmacySupplier =
    models.PharmacySupplier || model<IPharmacySupplier>("PharmacySupplier", pharmacySupplierSchema);

export default PharmacySupplier;
