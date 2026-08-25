import { Types } from "mongoose";
import roleHierarchyRepository, {
    RoleHierarchyRepository,
    SetHierarchyItemDto,
} from "@/repositories/role-hierarchy.repository";
import { IRoleHierarchy } from "@/interfaces/role-hierarchy.interface";

export class RoleHierarchyService {
    constructor(private repository: RoleHierarchyRepository = roleHierarchyRepository) { }

    async getHierarchiesByParent(parentRoleId: Types.ObjectId): Promise<IRoleHierarchy[]> {
        return await this.repository.findByParentRole(parentRoleId);
    }

    async getAllHierarchies(): Promise<IRoleHierarchy[]> {
        return await this.repository.findAll();
    }

    async setHierarchies(
        parentRoleId: Types.ObjectId,
        items: SetHierarchyItemDto[]
    ): Promise<IRoleHierarchy[]> {
        return await this.repository.setHierarchiesForParent(parentRoleId, items);
    }

    async canManage(
        parentRoleId: Types.ObjectId,
        targetRoleId: Types.ObjectId,
        requiredPermission: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
    ): Promise<boolean> {
        const hierarchy = await this.repository.findByParentAndTarget(parentRoleId, targetRoleId);
        if (!hierarchy) return false;
        return hierarchy.permissions.includes(requiredPermission);
    }
}

export default new RoleHierarchyService();
