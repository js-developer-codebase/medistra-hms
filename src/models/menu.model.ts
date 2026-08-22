import { Schema, model, Types } from "mongoose";
import { IMenu } from "@/interfaces/menu.interface";

const menuSchema = new Schema<IMenu>({
    name: String,
    path: String,
    icon: String,
    children: {
        type: [Types.ObjectId],
        ref: "Menu",
        default: []
    }
}, { timestamps: true });

export default model<IMenu>("Menu", menuSchema);