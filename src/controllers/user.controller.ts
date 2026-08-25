import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultUserService, { UserService } from "@/services/user.service";
import { CreateUserDto, UpdateUserDto } from "@/dto/user.dto";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import Role from "@/models/role.model";
import Organization from "@/models/organization.mode";
import roleHierarchyRepository from "@/repositories/role-hierarchy.repository";

function normalizeId(value: any): string {
    return ((value?._id || value) ?? "").toString();
}

function normalizeRoleId(value: any): string {
    return ((value?.roleId?._id || value?.roleId || value?.role?._id || value?.role || value?._id || value) ?? "").toString();
}

async function branchBelongsToOrganization(branchId: string, organizationId: string): Promise<boolean> {
    if (!branchId || !organizationId) return false;

    const branch = await Organization.findById(branchId).lean();
    if (!branch) return false;

    const headQuarterId = normalizeId(branch.headQuarter);
    return branch._id.toString() === organizationId || headQuarterId === organizationId;
}

async function hasRoleHierarchyPermission(parentRole: any, targetRoleId: string, permission: "CREATE" | "READ" | "UPDATE" | "DELETE"): Promise<boolean> {
    const hierarchy = await roleHierarchyRepository.findByParentAndTarget(
        parentRole._id,
        new Types.ObjectId(targetRoleId)
    );

    if (hierarchy?.permissions?.includes(permission)) return true;

    return Boolean(currentUserRoleLegacyPermissions(parentRole, targetRoleId)?.includes(permission));
}

function currentUserRoleLegacyPermissions(parentRole: any, targetRoleId: string): string[] | undefined {
    return parentRole.managedRoles?.find((item: any) => normalizeRoleId(item) === targetRoleId)?.permissions;
}

export class UserController {
    constructor(private userService: UserService = defaultUserService) { }

    async createUser(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data: CreateUserDto = await request.json();

            if (!data.name || !data.email || !data.password || !data.gender || !data.role) {
                return NextResponse.json(
                    { success: false, message: "Fields 'name', 'email', 'password', 'gender', and 'role' are required" },
                    { status: 400 }
                );
            }

            if (!Types.ObjectId.isValid(data.role)) {
                return NextResponse.json(
                    { success: false, message: "Invalid role ID format" },
                    { status: 400 }
                );
            }

            if (data.organization && !Types.ObjectId.isValid(data.organization)) {
                return NextResponse.json(
                    { success: false, message: "Invalid organization ID format" },
                    { status: 400 }
                );
            }

            if (data.branch && !Types.ObjectId.isValid(data.branch)) {
                return NextResponse.json(
                    { success: false, message: "Invalid branch ID format" },
                    { status: 400 }
                );
            }

            // --- Access Control Checks ---
            const session = await getServerSession(authOptions);
            if (!session || !session.user) {
                return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
            }

            const currentUser: any = session.user;
            let isGlobalAdmin = false;
            let currentUserRole: any = null;

            if (currentUser.role) {
                currentUserRole = await Role.findById(currentUser.role);
                if (currentUserRole && currentUserRole.role === "SUPER_ADMIN") {
                    isGlobalAdmin = true;
                }
            }

            if (!isGlobalAdmin) {
                if (!currentUser.organization) {
                    return NextResponse.json({ success: false, message: "Current user has no organization scope" }, { status: 403 });
                }

                const currentOrganizationId = currentUser.organization.toString();
                data.organization = data.organization || currentOrganizationId;

                if (currentUser.branch) {
                    data.branch = data.branch || currentUser.branch.toString();
                }

                // 1. Organization Check
                if (data.organization?.toString() !== currentOrganizationId) {
                    return NextResponse.json({ success: false, message: "Cannot create user outside your organization" }, { status: 403 });
                }

                // 2. Branch Check
                if (currentUser.branch) { // Current user is branch-level
                    if (data.branch?.toString() !== currentUser.branch?.toString()) {
                        return NextResponse.json({ success: false, message: "Cannot create user outside your branch" }, { status: 403 });
                    }
                } else if (data.branch) {
                    const branchAllowed = await branchBelongsToOrganization(data.branch.toString(), currentOrganizationId);
                    if (!branchAllowed) {
                        return NextResponse.json({ success: false, message: "Cannot create user in a branch outside your organization" }, { status: 403 });
                    }
                }

                // 3. Role Check
                if (!currentUserRole) {
                    return NextResponse.json({ success: false, message: "Current user role not found" }, { status: 403 });
                }

                const hasCreatePermission = await hasRoleHierarchyPermission(currentUserRole, data.role.toString(), "CREATE");

                if (!hasCreatePermission) {
                    return NextResponse.json({ success: false, message: "You do not have permission to create a user with this role" }, { status: 403 });
                }
            }
            // --- End Access Control Checks ---

            const user = await this.userService.createUser(data);

            return NextResponse.json(
                { success: true, message: "User created successfully", data: user },
                { status: 201 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to create user" },
                { status: statusCode }
            );
        }
    }

    async getUsers(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();

            const session = await getServerSession(authOptions);
            if (!session || !session.user) {
                return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
            }

            const currentUser: any = session.user;
            let isGlobalAdmin = false;
            let currentUserRole: any = null;

            if (currentUser.role) {
                currentUserRole = await Role.findById(currentUser.role);
                if (currentUserRole && currentUserRole.role === "SUPER_ADMIN") {
                    isGlobalAdmin = true;
                }
            }

            const { searchParams } = new URL(request.url);
            const organizationId = searchParams.get('organizationId');

            let users: any[];

            if (organizationId) {
                if (!Types.ObjectId.isValid(organizationId)) {
                    return NextResponse.json(
                        { success: false, message: "Invalid organization ID" },
                        { status: 400 }
                    );
                }
                users = await this.userService.getUsersByOrganizationId(new Types.ObjectId(organizationId));
            } else {
                users = await this.userService.getAllUsers();
            }

            if (!isGlobalAdmin) {
                // 1. Filter by Organization
                if (currentUser.organization) {
                    users = users.filter(u => {
                        const orgId = (u.organization?._id || u.organization)?.toString();
                        return orgId === currentUser.organization.toString();
                    });
                }

                // 2. Filter by Branch
                if (currentUser.branch) {
                    users = users.filter(u => {
                        const brId = (u.branch?._id || u.branch)?.toString();
                        return brId === currentUser.branch.toString();
                    });
                }

                // 3. Filter by Role Hierarchy (roles with READ access in RoleHierarchy / managedRoles, plus the user's own account)
                if (!currentUserRole) {
                    return NextResponse.json({ success: false, message: "Current user role not found" }, { status: 403 });
                }

                const hierarchies = await roleHierarchyRepository.findByParentRole(currentUserRole._id);
                const readableRoleIdsFromHierarchy = hierarchies
                    .filter((h: any) => h.permissions?.includes("READ"))
                    .map((h: any) => (h.targetRole?._id || h.targetRole)?.toString());

                const readableRoleIdsFromLegacy = currentUserRole?.managedRoles
                    ?.filter((mr: any) => mr.permissions?.includes("READ"))
                    ?.map((mr: any) => (mr.roleId?._id || mr.roleId)?.toString()) || [];

                const readableRoleIds = Array.from(new Set([...readableRoleIdsFromHierarchy, ...readableRoleIdsFromLegacy]));

                users = users.filter(u => {
                    const uId = (u._id?._id || u._id)?.toString();
                    const isSelf = uId === currentUser.id?.toString();
                    const uRoleId = (u.role?._id || u.role)?.toString();
                    const isManagedRole = uRoleId && readableRoleIds.includes(uRoleId);
                    return isSelf || isManagedRole;
                });
            }

            return NextResponse.json(
                { success: true, count: users.length, data: users },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch users" },
                { status: 500 }
            );
        }
    }

    async getUserById(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid user ID" },
                    { status: 400 }
                );
            }

            const user = await this.userService.getUserById(new Types.ObjectId(id));
            if (!user) {
                return NextResponse.json(
                    { success: false, message: "User not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: user },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch user" },
                { status: 500 }
            );
        }
    }

    async updateUser(request: NextRequest, id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid user ID" },
                    { status: 400 }
                );
            }

            const data: UpdateUserDto = await request.json();

            if (data.role && !Types.ObjectId.isValid(data.role)) {
                return NextResponse.json(
                    { success: false, message: "Invalid role ID format" },
                    { status: 400 }
                );
            }

            if (data.organization && !Types.ObjectId.isValid(data.organization)) {
                return NextResponse.json(
                    { success: false, message: "Invalid organization ID format" },
                    { status: 400 }
                );
            }

            if (data.branch && !Types.ObjectId.isValid(data.branch)) {
                return NextResponse.json(
                    { success: false, message: "Invalid branch ID format" },
                    { status: 400 }
                );
            }

            // --- Access Control Checks ---
            const session = await getServerSession(authOptions);
            if (!session || !session.user) {
                return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
            }

            const currentUser: any = session.user;
            let isGlobalAdmin = false;
            let currentUserRole: any = null;

            if (currentUser.role) {
                currentUserRole = await Role.findById(currentUser.role);
                if (currentUserRole && currentUserRole.role === "SUPER_ADMIN") {
                    isGlobalAdmin = true;
                }
            }

            if (!isGlobalAdmin) {
                const targetUser = await this.userService.getUserById(new Types.ObjectId(id));
                if (!targetUser) {
                    return NextResponse.json({ success: false, message: "Target user not found" }, { status: 404 });
                }

                if (!currentUser.organization) {
                    return NextResponse.json({ success: false, message: "Current user has no organization scope" }, { status: 403 });
                }

                const currentOrganizationId = currentUser.organization.toString();
                const targetOrganizationId = normalizeId(targetUser.organization);
                const targetBranchId = normalizeId(targetUser.branch);

                // 1. Organization Check
                if (targetOrganizationId !== currentOrganizationId) {
                    return NextResponse.json({ success: false, message: "Cannot update user outside your organization" }, { status: 403 });
                }
                if (data.organization && data.organization.toString() !== currentOrganizationId) {
                     return NextResponse.json({ success: false, message: "Cannot move user outside your organization" }, { status: 403 });
                }

                // 2. Branch Check
                if (currentUser.branch) { // Current user is branch-level
                    if (targetBranchId !== currentUser.branch.toString()) {
                        return NextResponse.json({ success: false, message: "Cannot update user outside your branch" }, { status: 403 });
                    }
                    if (data.branch && data.branch.toString() !== currentUser.branch?.toString()) {
                        return NextResponse.json({ success: false, message: "Cannot move user outside your branch" }, { status: 403 });
                    }
                } else if (data.branch) {
                    const branchAllowed = await branchBelongsToOrganization(data.branch.toString(), currentOrganizationId);
                    if (!branchAllowed) {
                        return NextResponse.json({ success: false, message: "Cannot move user to a branch outside your organization" }, { status: 403 });
                    }
                }

                // 3. Role Check
                if (!currentUserRole) {
                    return NextResponse.json({ success: false, message: "Current user role not found" }, { status: 403 });
                }

                const roleToCheck = data.role ? data.role.toString() : normalizeId(targetUser.role);
                const hasUpdatePermission = await hasRoleHierarchyPermission(currentUserRole, roleToCheck, "UPDATE");

                if (!hasUpdatePermission) {
                    return NextResponse.json({ success: false, message: "You do not have permission to update this user's role" }, { status: 403 });
                }
            }
            // --- End Access Control Checks ---

            const user = await this.userService.updateUser(new Types.ObjectId(id), data);

            return NextResponse.json(
                { success: true, message: "User updated successfully", data: user },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update user" },
                { status: statusCode }
            );
        }
    }

    async deleteUser(id: string): Promise<NextResponse> {
        try {
            await dbConnect();

            if (!Types.ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid user ID" },
                    { status: 400 }
                );
            }

            // --- Access Control Checks ---
            const session = await getServerSession(authOptions);
            if (!session || !session.user) {
                return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
            }

            const currentUser: any = session.user;
            let isGlobalAdmin = false;
            let currentUserRole: any = null;

            if (currentUser.role) {
                currentUserRole = await Role.findById(currentUser.role);
                if (currentUserRole && currentUserRole.role === "SUPER_ADMIN") {
                    isGlobalAdmin = true;
                }
            }

            if (!isGlobalAdmin) {
                const targetUser = await this.userService.getUserById(new Types.ObjectId(id));
                if (!targetUser) {
                    return NextResponse.json({ success: false, message: "Target user not found" }, { status: 404 });
                }

                if (!currentUser.organization) {
                    return NextResponse.json({ success: false, message: "Current user has no organization scope" }, { status: 403 });
                }

                const currentOrganizationId = currentUser.organization.toString();
                const targetOrganizationId = normalizeId(targetUser.organization);
                const targetBranchId = normalizeId(targetUser.branch);

                // 1. Organization Check
                if (targetOrganizationId !== currentOrganizationId) {
                    return NextResponse.json({ success: false, message: "Cannot delete user outside your organization" }, { status: 403 });
                }

                // 2. Branch Check
                if (currentUser.branch) { // Current user is branch-level
                    if (targetBranchId !== currentUser.branch.toString()) {
                        return NextResponse.json({ success: false, message: "Cannot delete user outside your branch" }, { status: 403 });
                    }
                }

                // 3. Role Check
                if (!currentUserRole) {
                    return NextResponse.json({ success: false, message: "Current user role not found" }, { status: 403 });
                }

                const hasDeletePermission = await hasRoleHierarchyPermission(currentUserRole, normalizeId(targetUser.role), "DELETE");

                if (!hasDeletePermission) {
                    return NextResponse.json({ success: false, message: "You do not have permission to delete a user with this role" }, { status: 403 });
                }
            }
            // --- End Access Control Checks ---

            await this.userService.deleteUser(new Types.ObjectId(id));

            return NextResponse.json(
                { success: true, message: "User deleted successfully" },
                { status: 200 }
            );
        } catch (error: any) {
            const statusCode = error?.statusCode || 500;
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to delete user" },
                { status: statusCode }
            );
        }
    }
}

export default new UserController();
