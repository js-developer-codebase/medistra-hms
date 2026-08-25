import { Schema, model } from "mongoose";
import { IRole } from "@/interfaces/role.interface";

const accessSchema = new Schema({
    moduleName: { type: String, required: true },
    permissions: { type: [String], default: [] },
}, { _id: false });

const roleSchema = new Schema<IRole>({
    role: {
        type: String,
        required: true,
    },
    access: {
        type: [accessSchema],
        required: true,
        default: [],
    }
}, { timestamps: true });

const Role = model<IRole>("Role", roleSchema);

export default Role;