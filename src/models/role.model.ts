import { Schema, model } from "mongoose";
import { IRole } from "@/interfaces/role.interface";

const roleSchema = new Schema<IRole>({
    role: {
        type: String,
        required: true,
    },
    access: {
        type: [Array],
        required: true,
    }
}, { timestamps: true });

const Role = model<IRole>("Role", roleSchema);

export default Role;