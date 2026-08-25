import mongoose, { Schema, model, Types } from "mongoose";
import { IBed } from "@/interfaces/bed.interface"

const bedSchema = new Schema<IBed>(
    {
        bedNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        roomId: {
            type: Types.ObjectId,
            ref: 'Room',
            required: true
        },
        bedType: {
            type: String,
            enum: [
                "NORMAL",
                "ELECTRIC",
                "ICU",
                "PEDIATRIC",
            ],
            default: 'NORMAL'
        },
        status: {
            type: String,
            enum: [
                "AVAILABLE",
                "OCCUPIED",
                "RESERVED",
                "MAINTENANCE",
                "BLOCKED",
            ],
            default: 'AVAILABLE'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, { timestamps: true })

const Bed = mongoose.models.Bed || mongoose.model<IBed>('Bed', bedSchema);
export default Bed;