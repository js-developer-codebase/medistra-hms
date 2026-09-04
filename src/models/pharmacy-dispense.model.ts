import { Schema, model, Types, models } from "mongoose";

export interface IDispensedItem {
    medicineId: Types.ObjectId;
    medicineName: string;
    batchNumber?: string;
    dosageForm?: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    gstPercent?: number;
    totalAmount: number;
}

export interface IPharmacyDispense {
    billNumber: string;
    prescriptionId?: Types.ObjectId;
    patientId?: Types.ObjectId;
    patientName: string;
    patientPhone?: string;
    uhid?: string;
    items: IDispensedItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paymentMode: "CASH" | "UPI" | "CARD" | "CREDIT_HOSPITAL" | "INSURANCE";
    paymentStatus: "PAID" | "PENDING" | "REFUNDED";
    dispensedBy?: Types.ObjectId;
    pharmacistName?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const dispensedItemSchema = new Schema<IDispensedItem>(
    {
        medicineId: { type: Schema.Types.ObjectId, ref: "Medicine", required: true },
        medicineName: { type: String, required: true },
        batchNumber: { type: String },
        dosageForm: { type: String, default: "TABLET" },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, default: 0 },
        discountPercent: { type: Number, default: 0 },
        gstPercent: { type: Number, default: 12 },
        totalAmount: { type: Number, required: true, default: 0 }
    },
    { _id: false }
);

const pharmacyDispenseSchema = new Schema<IPharmacyDispense>(
    {
        billNumber: { type: String, required: true, unique: true },
        prescriptionId: { type: Schema.Types.ObjectId, ref: "Prescription" },
        patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
        patientName: { type: String, required: true },
        patientPhone: { type: String },
        uhid: { type: String },
        items: [dispensedItemSchema],
        subtotal: { type: Number, required: true, default: 0 },
        discountAmount: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true, default: 0 },
        paymentMode: {
            type: String,
            enum: ["CASH", "UPI", "CARD", "CREDIT_HOSPITAL", "INSURANCE"],
            default: "CASH"
        },
        paymentStatus: {
            type: String,
            enum: ["PAID", "PENDING", "REFUNDED"],
            default: "PAID"
        },
        dispensedBy: { type: Schema.Types.ObjectId, ref: "User" },
        pharmacistName: { type: String, default: "Chief Pharmacist" },
        notes: { type: String }
    },
    { timestamps: true }
);

const PharmacyDispense =
    models.PharmacyDispense || model<IPharmacyDispense>("PharmacyDispense", pharmacyDispenseSchema);

export default PharmacyDispense;
