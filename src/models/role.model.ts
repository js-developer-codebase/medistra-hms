import mongoose, { Schema } from "mongoose";
import { IRole } from "@/interfaces/role.interface";

const accessSchema = new Schema({
    moduleName: { type: String, required: true },
    permissions: { type: [String], default: [] },
}, { _id: false });

const managedRoleSchema = new Schema({
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    permissions: { type: [String], enum: ['CREATE', 'READ', 'UPDATE', 'DELETE'], default: [] }
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
    },
    managedRoles: {
        type: [managedRoleSchema],
        default: []
    }
}, { timestamps: true });

const Role = mongoose.models.Role || mongoose.model<IRole>("Role", roleSchema);

export default Role;