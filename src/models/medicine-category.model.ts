import { Schema, model, models } from "mongoose";

export interface IMedicineCategory {
    name: string;
    code: string;
    description?: string;
    storageCondition: "ROOM_TEMPERATURE" | "REFRIGERATED_2_8C" | "COOL_DRY" | "NARCOTICS_VAULT";
    requiresPrescription: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const medicineCategorySchema = new Schema<IMedicineCategory>(
    {
        name: { type: String, required: true, unique: true },
        code: { type: String, required: true, uppercase: true },
        description: { type: String },
        storageCondition: {
            type: String,
            enum: ["ROOM_TEMPERATURE", "REFRIGERATED_2_8C", "COOL_DRY", "NARCOTICS_VAULT"],
            default: "ROOM_TEMPERATURE"
        },
        requiresPrescription: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const MedicineCategory =
    models.MedicineCategory || model<IMedicineCategory>("MedicineCategory", medicineCategorySchema);

export default MedicineCategory;
