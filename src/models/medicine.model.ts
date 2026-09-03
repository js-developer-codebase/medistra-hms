import { Schema, model, models } from "mongoose";
import { IMedicine } from "@/interfaces/medicine.interface";

const medicineSchema = new Schema<IMedicine>(
    {
        name: { type: String, required: true },
        category: { type: String, required: true },
        genericName: { type: String },
        dosageForm: { type: String, default: "TABLET" },
        manufacturer: { type: String },
        batchNumber: { type: String },
        rackLocation: { type: String, default: "Rack A-01" },
        shelfNumber: { type: String, default: "Shelf 1" },
        hsnCode: { type: String, default: "3004" },
        gstRate: { type: Number, default: 12 },
        expiryDate: { type: Date, required: true },
        unitPrice: { type: Number, required: true, default: 0 },
        stockQuantity: { type: Number, required: true, default: 0 },
        reorderLevel: { type: Number, required: true, default: 10 },
        minStockLevel: { type: Number, default: 5 },
        maxStockLevel: { type: Number, default: 500 },
        description: { type: String },
        isActive: { type: Boolean, default: true }
    }, 
    { timestamps: true }
);

const Medicine = models.Medicine || model<IMedicine>('Medicine', medicineSchema);
export default Medicine;
