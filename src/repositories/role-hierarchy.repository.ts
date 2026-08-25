import { Types } from "mongoose";
import RoleHierarchy from "@/models/role-hierarchy.model";
import { IRoleHierarchy, RolePermissionType } from "@/interfaces/role-hierarchy.interface";

export interface SetHierarchyItemDto {
    targetRole: Types.ObjectId | string;
    permissions: RolePermissionType[];
}

export class RoleHierarchyRepository {
    async findByParentRole(parentRoleId: Types.ObjectId): Promise<IRoleHierarchy[]> {
        return await RoleHierarchy.find({ parentRole: parentRoleId })
            .populate("targetRole")
            .populate("parentRole")
            .lean();
    }

    async findByParentAndTarget(
        parentRoleId: Types.ObjectId,
        targetRoleId: Types.ObjectId
    ): Promise<IRoleHierarchy | null> {
        return await RoleHierarchy.findOne({ parentRole: parentRoleId, targetRole: targetRoleId }).lean();
    }

    async findAll(): Promise<IRoleHierarchy[]> {
        return await RoleHierarchy.find()
            .populate("targetRole")
            .populate("parentRole")
            .lean();
    }

    async upsertHierarchy(
        parentRoleId: Types.ObjectId,
        targetRoleId: Types.ObjectId,
        permissions: RolePermissionType[]
    ): Promise<IRoleHierarchy | null> {
        return await RoleHierarchy.findOneAndUpdate(
            { parentRole: parentRoleId, targetRole: targetRoleId },
            { parentRole: parentRoleId, targetRole: targetRoleId, permissions },
            { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
        ).lean();
    }

    async setHierarchiesForParent(
        parentRoleId: Types.ObjectId,
        items: SetHierarchyItemDto[]
    ): Promise<IRoleHierarchy[]> {
        // Remove existing hierarchies for this parent role
        await RoleHierarchy.deleteMany({ parentRole: parentRoleId });

        if (!items || items.length === 0) {
            return [];
        }

        const docsToInsert = items.map((item) => ({
            parentRole: parentRoleId,
            targetRole: new Types.ObjectId(item.targetRole.toString()),
            permissions: item.permissions,
        }));

        await RoleHierarchy.insertMany(docsToInsert);
        return await this.findByParentRole(parentRoleId);
    }

    async deleteByParentRole(parentRoleId: Types.ObjectId): Promise<void> {
        await RoleHierarchy.deleteMany({ parentRole: parentRoleId });
    }

    async deleteByRole(roleId: Types.ObjectId): Promise<void> {
        await RoleHierarchy.deleteMany({
            $or: [{ parentRole: roleId }, { targetRole: roleId }],
        });
    }
}

export default new RoleHierarchyRepository();
