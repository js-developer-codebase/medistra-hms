import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import roleHierarchyService, { RoleHierarchyService } from "@/services/role-hierarchy.service";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import Role from "@/models/role.model";

function normalizeRoleId(value: any): string {
    return ((value?.roleId?._id || value?.roleId || value?.targetRole?._id || value?.targetRole || value?.role?._id || value?.role || value?._id || value) ?? "").toString();
}

async function getManagedRolePermissions(parentRole: any, targetRoleId: string): Promise<string[]> {
    const entries = await roleHierarchyService.getHierarchiesByParent(parentRole._id);
    const match = entries.find((item: any) => normalizeRoleId(item.targetRole) === targetRoleId);
    if (match?.permissions) return match.permissions;

    return parentRole.managedRoles?.find((item: any) => normalizeRoleId(item) === targetRoleId)?.permissions || [];
}

export class RoleHierarchyController {
    constructor(private service: RoleHierarchyService = roleHierarchyService) { }

    async getHierarchies(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const parentRole = searchParams.get("parentRole");

            if (parentRole) {
                if (!Types.ObjectId.isValid(parentRole)) {
                    return NextResponse.json(
                        { success: false, message: "Invalid parentRole ID" },
                        { status: 400 }
                    );
                }
                const items = await this.service.getHierarchiesByParent(new Types.ObjectId(parentRole));
                return NextResponse.json({ success: true, count: items.length, data: items }, { status: 200 });
            }

            const all = await this.service.getAllHierarchies();
            return NextResponse.json({ success: true, count: all.length, data: all }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to fetch role hierarchies" },
                { status: 500 }
            );
        }
    }

    async setHierarchies(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const session = await getServerSession(authOptions);
            if (!session?.user) {
                return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
            }

            const body = await request.json();
            const { parentRole, hierarchies } = body;

            if (!parentRole || !Types.ObjectId.isValid(parentRole)) {
                return NextResponse.json(
                    { success: false, message: "Valid parentRole ID is required" },
                    { status: 400 }
                );
            }

            if (!Array.isArray(hierarchies)) {
                return NextResponse.json(
                    { success: false, message: "hierarchies array is required" },
                    { status: 400 }
                );
            }

            // Security: Check if modifying user is SUPER_ADMIN or has permission to delegate
            if (session.user.role) {
                const modifierRole = await Role.findById(session.user.role);
                if (modifierRole && modifierRole.role !== "SUPER_ADMIN") {
                    const parentRolePermissions = await getManagedRolePermissions(modifierRole, parentRole);
                    if (!parentRolePermissions.includes("UPDATE")) {
                        return NextResponse.json(
                            { success: false, message: "You do not have permission to update this role hierarchy" },
                            { status: 403 }
                        );
                    }

                    // Non-super-admins can only delegate roles that they themselves manage
                    for (const item of hierarchies) {
                        const targetId = normalizeRoleId(item);
                        if (!Types.ObjectId.isValid(targetId)) {
                            return NextResponse.json(
                                { success: false, message: `Invalid target role: ${targetId}` },
                                { status: 400 }
                            );
                        }

                        const matchingPermissions = await getManagedRolePermissions(modifierRole, targetId);
                        if (matchingPermissions.length === 0) {
                            return NextResponse.json(
                                { success: false, message: `You do not have permission to manage role: ${targetId}` },
                                { status: 403 }
                            );
                        }
                        for (const p of item.permissions || []) {
                            if (!matchingPermissions.includes(p)) {
                                return NextResponse.json(
                                    { success: false, message: `You cannot grant ${p} permission for role: ${targetId}` },
                                    { status: 403 }
                                );
                            }
                        }
                    }
                }
            }

            const result = await this.service.setHierarchies(
                new Types.ObjectId(parentRole),
                hierarchies.map((h: any) => ({
                    targetRole: new Types.ObjectId((h.targetRole?._id || h.targetRole || h.roleId || h.role).toString()),
                    permissions: h.permissions,
                }))
            );

            return NextResponse.json(
                { success: true, message: "Role hierarchies updated successfully", data: result },
                { status: 200 }
            );
        } catch (error: any) {
            return NextResponse.json(
                { success: false, message: error?.message || "Failed to update role hierarchies" },
                { status: 500 }
            );
        }
    }
}

export default new RoleHierarchyController();
