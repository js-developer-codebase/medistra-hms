import { Schema, model, Types } from "mongoose"
import { IRoom } from "@/interfaces/room.interface"

const roomSchema = new Schema<IRoom>(
    {
        roomNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        roomType: {
            type: String,
            enum: [
                "GENERAL",
                "PRIVATE",
                "SEMI_PRIVATE",
                "ICU",
                "ISOLATION",
                "DELUXE",
            ],
            default: 'GENERAL'
        },
        wardId: {
            type: Types.ObjectId,
            ref: 'Ward',
            required: true
        },
        description: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, { timestamps: true })

const Room = model<IRoom>('Room', roomSchema);
export default Room;