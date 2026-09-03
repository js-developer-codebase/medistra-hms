import { Schema, model, Types, models } from "mongoose";

export interface IReturnItem {
    medicineId: Types.ObjectId;
    medicineName: string;
    batchNumber?: string;
    quantity: number;
    unitPrice: number;
    refundAmount: number;
    condition: "INTACT_RESTOCKABLE" | "DAMAGED_EXPIRED_DISCARD";
    restocked: boolean;
}

export interface IPharmacyReturn {
    returnNumber: string;
    dispenseId?: Types.ObjectId;
    billNumber?: string;
    patientId?: Types.ObjectId;
    patientName: string;
    items: IReturnItem[];
    reason: "ADVERSE_REACTION" | "MEDICATION_CHANGED" | "OVERPRESCRIBED" | "PATIENT_DISCHARGED" | "OTHER";
    totalRefund: number;
    status: "PENDING" | "APPROVED" | "PROCESSED" | "REJECTED";
    handledBy?: Types.ObjectId;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const returnItemSchema = new Schema<IReturnItem>(
    {
        medicineId: { type: Schema.Types.ObjectId, ref: "Medicine", required: true },
        medicineName: { type: String, required: true },
        batchNumber: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, default: 0 },
        refundAmount: { type: Number, required: true, default: 0 },
        condition: {
            type: String,
            enum: ["INTACT_RESTOCKABLE", "DAMAGED_EXPIRED_DISCARD"],
            default: "INTACT_RESTOCKABLE"
        },
        restocked: { type: Boolean, default: false }
    },
    { _id: false }
);

const pharmacyReturnSchema = new Schema<IPharmacyReturn>(
    {
        returnNumber: { type: String, required: true, unique: true },
        dispenseId: { type: Schema.Types.ObjectId, ref: "PharmacyDispense" },
        billNumber: { type: String },
        patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
        patientName: { type: String, required: true },
        items: [returnItemSchema],
        reason: {
            type: String,
            enum: ["ADVERSE_REACTION", "MEDICATION_CHANGED", "OVERPRESCRIBED", "PATIENT_DISCHARGED", "OTHER"],
            default: "MEDICATION_CHANGED"
        },
        totalRefund: { type: Number, required: true, default: 0 },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "PROCESSED", "REJECTED"],
            default: "PROCESSED"
        },
        handledBy: { type: Schema.Types.ObjectId, ref: "User" },
        notes: { type: String }
    },
    { timestamps: true }
);

const PharmacyReturn =
    models.PharmacyReturn || model<IPharmacyReturn>("PharmacyReturn", pharmacyReturnSchema);

export default PharmacyReturn;
