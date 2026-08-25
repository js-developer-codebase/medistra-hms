import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultRoleService, { RoleService } from "@/services/role.service";
import { CreateRoleDto, UpdateRoleDto } from "@/dto/role.dto";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import Role from "@/models/role.model";

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

            // Security: Ensure user only grants permissions they have
            const session = await getServerSession(authOptions);
            if (session?.user?.role) {
                const creatorRole = await Role.findById(session.user.role);
                if (creatorRole && creatorRole.role !== "SUPER_ADMIN") {
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
                            const reqId = ((reqManaged as any).roleId?._id || (reqManaged as any).roleId || (reqManaged as any).role)?.toString();
                            const creatorManaged = creatorRole.managedRoles?.find((m: any) => {
                                const mId = (m.roleId?._id || m.roleId)?.toString();
                                return mId === reqId;
                            });
                            if (!creatorManaged) {
                                return NextResponse.json({ success: false, message: `You do not have permission to manage role ID: ${reqId}` }, { status: 403 });
                            }
                            for (const p of reqManaged.permissions) {
                                if (!creatorManaged.permissions.includes(p)) {
                                    return NextResponse.json({ success: false, message: `You cannot grant ${p} permission for managed role ID: ${reqId}` }, { status: 403 });
                                }
                            }
                        }
                    }
                }
            }

            const role = await this.roleService.createRole(data);

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

    async getRoles(): Promise<NextResponse> {
        try {
            await dbConnect();
            let roles = await this.roleService.getAllRoles();

            const session = await getServerSession(authOptions);
            if (session?.user?.role) {
                const currentUserRole = await Role.findById(session.user.role);
                if (currentUserRole && currentUserRole.role !== "SUPER_ADMIN") {
                    // Get IDs of roles they can manage
                    const managedRoleIds = currentUserRole.managedRoles?.map((mr: any) => (mr.roleId?._id || mr.roleId)?.toString()) || [];
                    
                    // Filter roles: they can see roles they manage, plus their own role
                    roles = roles.filter(r => 
                        r._id.toString() === currentUserRole._id.toString() || 
                        managedRoleIds.includes(r._id.toString())
                    );
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

            return NextResponse.json(
                { success: true, data: role },
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
            if (session?.user?.role) {
                const modifierRole = await Role.findById(session.user.role);
                if (modifierRole && modifierRole.role !== "SUPER_ADMIN") {
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
                            const reqId = ((reqManaged as any).roleId?._id || (reqManaged as any).roleId || (reqManaged as any).role)?.toString();
                            const modifierManaged = modifierRole.managedRoles?.find((m: any) => {
                                const mId = (m.roleId?._id || m.roleId)?.toString();
                                return mId === reqId;
                            });
                            if (!modifierManaged) {
                                return NextResponse.json({ success: false, message: `You do not have permission to manage role ID: ${reqId}` }, { status: 403 });
                            }
                            for (const p of reqManaged.permissions) {
                                if (!modifierManaged.permissions.includes(p)) {
                                    return NextResponse.json({ success: false, message: `You cannot grant ${p} permission for managed role ID: ${reqId}` }, { status: 403 });
                                }
                            }
                        }
                    }
                }
            }

            const role = await this.roleService.updateRole(new Types.ObjectId(id), data);

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

            await this.roleService.deleteRole(new Types.ObjectId(id));

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
