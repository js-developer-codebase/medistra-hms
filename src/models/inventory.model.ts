import { Schema, model, Types } from "mongoose";
import { IInventory } from "@/interfaces/inventory.interface"

const inventorySchema = new Schema<IInventory>({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    inward: {
        type: Number,
        required: true
    },
    outward: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    batchNo: {
        type: String,
        required: true
    },
    branchId: {
        type: Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    }
});

export default model<IInventory>("Inventory", inventorySchema);