import { Schema, model, Types } from "mongoose";
import { IWard } from "@/interfaces/ward.interface";

const wardSchema = new Schema<IWard>(
    {
        wardName: {
            type: String,
            required: true
        },
        wardCode: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        wardType: {
            type: String,
            enum: [
                "GENERAL",
                "ICU",
                "CCU",
                "NICU",
                "PICU",
                "MATERNITY",
                "PEDIATRIC",
                "PRIVATE",
                "SEMI_PRIVATE",
                "EMERGENCY",
                "OTHER",
            ],
            default: 'GENERAL',
        },
        floor: {
            type: Number,
            required: true
        },
        organizationId: {
            type: Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, { timestamps: true })

const Ward = model<IWard>('Ward', wardSchema);
export default Ward;