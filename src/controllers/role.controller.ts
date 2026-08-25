import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultRoleService, { RoleService } from "@/services/role.service";
import { CreateRoleDto, UpdateRoleDto } from "@/dto/role.dto";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import Role from "@/models/role.model";
import roleHierarchyRepository from "@/repositories/role-hierarchy.repository";

const ROLE_PERMISSIONS: string[] = [];
type RolePermission = string;

function normalizeRoleId(value: any): string {
    if (typeof value === "string") return value;
    if (value instanceof Types.ObjectId) return value.toString();
    if (value?._id) return normalizeRoleId(value._id);
    if (value?.roleId) return normalizeRoleId(value.roleId);
    if (value?.role) return normalizeRoleId(value.role);
    if (value?.buffer && Array.isArray(value.buffer?.data)) {
        return new Types.ObjectId(Buffer.from(value.buffer.data)).toString();
    }
    return (value ?? "").toString();
}

function hasModulePermission(role: any, moduleName: string, permission: RolePermission): boolean {
    return Boolean(
        role?.access?.some(
            (item: any) => item.moduleName === moduleName && item.permissions?.includes(permission)
        )
    );
}

async function getManagedRolePermissions(parentRole: any, targetRoleId: string): Promise<RolePermission[]> {
    const hierarchy = await roleHierarchyRepository.findByParentAndTarget(
        parentRole._id,
        new Types.ObjectId(targetRoleId)
    );

    if (hierarchy?.permissions) {
        return hierarchy.permissions as RolePermission[];
    }

    const legacy = parentRole.managedRoles?.find((item: any) => normalizeRoleId(item) === targetRoleId);
    return (legacy?.permissions || []) as RolePermission[];
}

export class RoleController {
    constructor(private roleService: RoleService = defaultRoleService) { }

    async createRole(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateRoleDto = await request.json();

            if (!data.role || !data.access || !Array.isArray(data.access)) {
                return NextResponse.json(
                    { success: false, message: "Fields 'role' and 'access' are required" },
                    { status: 400 }
                );
            }

            // Security: Ensure user only creates roles inside their delegated access.
            const session = await getServerSession(authOptions);
            if (!session?.user?.role) {
                return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
            }

            const creatorRoleId = normalizeRoleId(session.user.role);
            if (!Types.ObjectId.isValid(creatorRoleId)) {
                return NextResponse.json({ success: false, message: "Invalid current user role" }, { status: 403 });
            }

            const creatorRole = await Role.findById(creatorRoleId);
            if (!creatorRole) {
                return NextResponse.json({ success: false, message: "Current user role not found" }, { status: 403 });
            }

            if (creatorRole.role !== "SYSTEM_SUPER_ADMIN") {
                if (!hasModulePermission(creatorRole, "role", "role.role.create")) {
                    return NextResponse.json(
                        { success: false, message: "You do not have permission to create roles" },
                        { status: 403 }
                    );
                }

                // 1. Verify Module Access
                for (const reqAccess of data.access) {
                    const creatorAccess = creatorRole.access?.find((a: any) => a.moduleName === reqAccess.moduleName);
                    if (!creatorAccess) {
                        return NextResponse.json({ success: false, message: `You do not have access to module: ${reqAccess.moduleName}` }, { status: 403 });
                    }
                    for (const p of reqAccess.permissions) {
                        if (!creatorAccess.permissions.includes(p)) {
                            return NextResponse.json({ success: false, message: `You cannot grant ${p} permission for module: ${reqAccess.moduleName}` }, { status: 403 });
                        }
                    }
                }
                    
                // 2. Verify Managed Roles Access
                if (data.managedRoles && Array.isArray(data.managedRoles)) {
                    for (const reqManaged of data.managedRoles) {
                        const reqId = normalizeRoleId(reqManaged);
                        if (!Types.ObjectId.isValid(reqId)) {
                            return NextResponse.json({ success: false, message: `Invalid managed role ID: ${reqId}` }, { status: 400 });
                        }

                        const creatorPermissions = await getManagedRolePermissions(creatorRole, reqId);
                        if (creatorPermissions.length === 0) {
                            return NextResponse.json({ success: false, message: `You do not have permission to manage role ID: ${reqId}` }, { status: 403 });
                        }
                        for (const p of reqManaged.permissions) {
                            if (!creatorPermissions.includes(p as RolePermission)) {
                                return NextResponse.json({ success: false, message: `You cannot grant ${p} permission for managed role ID: ${reqId}` }, { status: 403 });
                            }
                        }
                    }
                }
            }

            const role = await this.roleService.createRole(data);

            // Sync to dedicated RoleHierarchy table
            if (data.managedRoles && Array.isArray(data.managedRoles)) {
                await roleHierarchyRepository.setHierarchiesForParent(
                    role._id,
                    data.managedRoles.map((m: any) => ({
                        targetRole: normalizeRoleId(m),
                        permissions: m.permissions,
                    }))
                );
            }

            const superAdminRole = await Role.findOne({ role: "SYSTEM_SUPER_ADMIN" });
            if (superAdminRole) {
                await roleHierarchyRepository.upsertHierarchy(
                    superAdminRole._id,
                    role._id,
                    [...ROLE_PERMISSIONS]
                );
            }

            if (creatorRole.role !== "SYSTEM_SUPER_ADMIN") {
                await roleHierarchyRepository.upsertHierarchy(
                    creatorRole._id,
                    role._id,
                    [...ROLE_PERMISSIONS]
                );
            }

            return NextResponse.json(
                { success: true, message: "Role created successfully", data: role },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create role" },
                { status: statusCode }
            );
        }
    }

    async getRoles(request?: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            let roles = await this.roleService.getAllRoles();

            const session = await getServerSession(authOptions);
            if (session?.user?.role) {
                const currentUserRoleId = normalizeRoleId(session.user.role);
                if (!Types.ObjectId.isValid(currentUserRoleId)) {
                    return NextResponse.json({ success: false, message: "Invalid current user role" }, { status: 403 });
                }

                const currentUserRole = await Role.findById(currentUserRoleId);
                if (currentUserRole && currentUserRole.role !== "SYSTEM_SUPER_ADMIN") {
                    let reqPerm: string | null = null;
                    let managedOnly = false;

                    if (request?.url) {
                        try {
                            const { searchParams } = new URL(request.url);
                            reqPerm = searchParams.get('permission') || searchParams.get('action');
                            managedOnly = searchParams.get('managedOnly') === 'true';
                        } catch {}
                    }

                    // If a specific permission (like CREATE when creating a user) or managedOnly is requested
                    if (reqPerm || managedOnly) {
                        const hierarchies = await roleHierarchyRepository.findByParentRole(currentUserRole._id);
                        const hierarchyIds = hierarchies
                            .filter((h: any) => !reqPerm || h.permissions?.includes(reqPerm.toUpperCase() as any))
                            .map((h: any) => (h.targetRole?._id || h.targetRole)?.toString());

                        const legacyIds = currentUserRole.managedRoles
                            ?.filter((mr: any) => !reqPerm || mr.permissions?.includes(reqPerm.toUpperCase()))
                            ?.map((mr: any) => (mr.roleId?._id || mr.roleId)?.toString()) || [];
                        
                        const managedRoleIds = Array.from(new Set([...hierarchyIds, ...legacyIds]));
                        roles = roles.filter(r => managedRoleIds.includes(r._id.toString()));
                    } else {
                        // In general role management, non-super-admins cannot see/edit SYSTEM_SUPER_ADMIN role
                        roles = roles.filter(r => r.role !== "SYSTEM_SUPER_ADMIN");
                    }
                }
            }

            return NextResponse.json(
                { success: true, count: roles.length, data: roles },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch roles" },
                { status: 500 }
            );
        }
    }

    async getRoleById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid role ID" },
                    { status: 400 }
                );
            }

            const role = await this.roleService.getRoleById(new Types.ObjectId(id));
            if (!role) {
                return NextResponse.json(
                    { success: false, message: "Role not found" },
                    { status: 404 }
                );
            }

            // Fetch hierarchies from dedicated RoleHierarchy table
            const hierarchies = await roleHierarchyRepository.findByParentRole(new Types.ObjectId(id));
            const roleObj: any = role;
            
            if (role.role === "SYSTEM_SUPER_ADMIN") {
                const allRoles = await this.roleService.getAllRoles();
                roleObj.managedRoles = allRoles
                    .filter(r => r._id.toString() !== id.toString())
                    .map(r => ({
                        roleId: r,
                        permissions: ["role.assign", "role.create", "role.update", "role.delete"]
                    }));
            } else if (hierarchies && hierarchies.length > 0) {
                roleObj.managedRoles = hierarchies.map((h: any) => ({
                    roleId: h.targetRole,
                    permissions: h.permissions,
                }));
            }

            return NextResponse.json(
                { success: true, data: roleObj },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch role" },
                { status: 500 }
            );
        }
    }

    async updateRole(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid role ID" },
                    { status: 400 }
                );
            }

            const data: UpdateRoleDto = await request.json();

            // Security: Ensure user only grants permissions they have
            const session = await getServerSession(authOptions);
            if (!session?.user?.role) {
                return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
            }

            const modifierRoleId = normalizeRoleId(session.user.role);
            if (!Types.ObjectId.isValid(modifierRoleId)) {
                return NextResponse.json({ success: false, message: "Invalid current user role" }, { status: 403 });
            }

            const modifierRole = await Role.findById(modifierRoleId);
            if (!modifierRole) {
                return NextResponse.json({ success: false, message: "Current user role not found" }, { status: 403 });
            }

            if (modifierRole.role !== "SYSTEM_SUPER_ADMIN") {
                const modifierPermissionsForRole = await getManagedRolePermissions(modifierRole, id);
                if (!modifierPermissionsForRole.includes("role.update") && !modifierPermissionsForRole.includes("role.assign")) {
                    return NextResponse.json(
                        { success: false, message: "You do not have permission to update this role" },
                        { status: 403 }
                    );
                }

                // 1. Verify Module Access
                if (data.access && Array.isArray(data.access)) {
                    for (const reqAccess of data.access) {
                        const modifierAccess = modifierRole.access?.find((a: any) => a.moduleName === reqAccess.moduleName);
                        if (!modifierAccess) {
                            return NextResponse.json({ success: false, message: `You do not have access to module: ${reqAccess.moduleName}` }, { status: 403 });
                        }
                        for (const p of reqAccess.permissions) {
                            if (!modifierAccess.permissions.includes(p)) {
                                return NextResponse.json({ success: false, message: `You cannot grant ${p} permission for module: ${reqAccess.moduleName}` }, { status: 403 });
                            }
                        }
                    }
                }
                    
                // 2. Verify Managed Roles Access
                if (data.managedRoles && Array.isArray(data.managedRoles)) {
                    for (const reqManaged of data.managedRoles) {
                        const reqId = normalizeRoleId(reqManaged);
                        if (!Types.ObjectId.isValid(reqId)) {
                            return NextResponse.json({ success: false, message: `Invalid managed role ID: ${reqId}` }, { status: 400 });
                        }

                        const modifierPermissions = await getManagedRolePermissions(modifierRole, reqId);
                        if (modifierPermissions.length === 0) {
                            return NextResponse.json({ success: false, message: `You do not have permission to manage role ID: ${reqId}` }, { status: 403 });
                        }
                        for (const p of reqManaged.permissions) {
                            if (!modifierPermissions.includes(p as RolePermission)) {
                                return NextResponse.json({ success: false, message: `You cannot grant ${p} permission for managed role ID: ${reqId}` }, { status: 403 });
                            }
                        }
                    }
                }
            }

            const role = await this.roleService.updateRole(new Types.ObjectId(id), data);

            // Sync to dedicated RoleHierarchy table
            if (data.managedRoles && Array.isArray(data.managedRoles)) {
                await roleHierarchyRepository.setHierarchiesForParent(
                    new Types.ObjectId(id),
                    data.managedRoles.map((m: any) => ({
                        targetRole: normalizeRoleId(m),
                        permissions: m.permissions,
                    }))
                );
            }

            return NextResponse.json(
                { success: true, message: "Role updated successfully", data: role },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update role" },
                { status: statusCode }
            );
        }
    }

    async deleteRole(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid role ID" },
                    { status: 400 }
                );
            }

            const session = await getServerSession(authOptions);
            if (!session?.user?.role) {
                return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
            }

            const deleterRoleId = normalizeRoleId(session.user.role);
            if (!Types.ObjectId.isValid(deleterRoleId)) {
                return NextResponse.json({ success: false, message: "Invalid current user role" }, { status: 403 });
            }

            const deleterRole = await Role.findById(deleterRoleId);
            if (!deleterRole) {
                return NextResponse.json({ success: false, message: "Current user role not found" }, { status: 403 });
            }

            if (deleterRole.role !== "SYSTEM_SUPER_ADMIN") {
                const deleterPermissionsForRole = await getManagedRolePermissions(deleterRole, id);
                if (!deleterPermissionsForRole.includes("role.delete")) {
                    return NextResponse.json(
                        { success: false, message: "You do not have permission to delete this role" },
                        { status: 403 }
                    );
                }
            }

            const roleToDelete = await this.roleService.getRoleById(new Types.ObjectId(id));
            if (roleToDelete?.role === "SYSTEM_SUPER_ADMIN") {
                return NextResponse.json(
                    { success: false, message: "SYSTEM_SUPER_ADMIN role cannot be deleted" },
                    { status: 403 }
                );
            }

            await this.roleService.deleteRole(new Types.ObjectId(id));
            await roleHierarchyRepository.deleteByRole(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "Role deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete role" },
                { status: statusCode }
            );
        }
    }
}

export default new RoleController();

