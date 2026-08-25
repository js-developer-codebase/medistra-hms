import mongoose, { Schema } from "mongoose";
import { IRoleHierarchy } from "@/interfaces/role-hierarchy.interface";

const roleHierarchySchema = new Schema<IRoleHierarchy>(
    {
        parentRole: {
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },
        targetRole: {
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },
        permissions: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

// Unique compound index so each (parentRole, targetRole) pair is unique
roleHierarchySchema.index({ parentRole: 1, targetRole: 1 }, { unique: true });

const RoleHierarchy =
    mongoose.models.RoleHierarchy ||
    mongoose.model<IRoleHierarchy>("RoleHierarchy", roleHierarchySchema);

export default RoleHierarchy;
