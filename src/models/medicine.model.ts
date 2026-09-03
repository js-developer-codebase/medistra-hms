import { Schema, model, Types, models } from "mongoose";
import { IMedicine } from "@/interfaces/medicine.interface";

const medicineSchema = new Schema<IMedicine>(
    {
        name: { type: String, required: true },
        category: { type: String, required: true },
        genericName: { type: String },
        manufacturer: { type: String },
        batchNumber: { type: String },
        expiryDate: { type: Date, required: true },
        unitPrice: { type: Number, required: true, default: 0 },
        stockQuantity: { type: Number, required: true, default: 0 },
        reorderLevel: { type: Number, required: true, default: 10 },
        description: { type: String },
        isActive: { type: Boolean, default: true }
    }, 
    { timestamps: true }
);

const Medicine = models.Medicine || model<IMedicine>('Medicine', medicineSchema);
export default Medicine;
