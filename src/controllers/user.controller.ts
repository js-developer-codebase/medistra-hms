import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultUserService, { UserService } from "@/services/user.service";
import { CreateUserDto, UpdateUserDto } from "@/dto/user.dto";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import Role from "@/models/role.model";

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
                // 1. Organization Check
                if (data.organization?.toString() !== currentUser.organization?.toString()) {
                    return NextResponse.json({ success: false, message: "Cannot create user outside your organization" }, { status: 403 });
                }

                // 2. Branch Check
                if (currentUser.branch) { // Current user is branch-level
                    if (data.branch?.toString() !== currentUser.branch?.toString()) {
                        return NextResponse.json({ success: false, message: "Cannot create user outside your branch" }, { status: 403 });
                    }
                }

                // 3. Role Check
                if (!currentUserRole) {
                    return NextResponse.json({ success: false, message: "Current user role not found" }, { status: 403 });
                }

                const hasCreatePermission = currentUserRole.managedRoles?.some((mr: any) => {
                    const mrId = (mr.roleId?._id || mr.roleId)?.toString();
                    return mrId === data.role.toString() && mr.permissions.includes("CREATE");
                });

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

            const { searchParams } = new URL(request.url);
            const organizationId = searchParams.get('organizationId');

            let users;

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

                // 1. Organization Check
                if (targetUser.organization?.toString() !== currentUser.organization?.toString()) {
                    return NextResponse.json({ success: false, message: "Cannot update user outside your organization" }, { status: 403 });
                }
                if (data.organization && data.organization.toString() !== currentUser.organization?.toString()) {
                     return NextResponse.json({ success: false, message: "Cannot move user outside your organization" }, { status: 403 });
                }

                // 2. Branch Check
                if (currentUser.branch) { // Current user is branch-level
                    if (targetUser.branch?.toString() !== currentUser.branch?.toString()) {
                        return NextResponse.json({ success: false, message: "Cannot update user outside your branch" }, { status: 403 });
                    }
                    if (data.branch && data.branch.toString() !== currentUser.branch?.toString()) {
                        return NextResponse.json({ success: false, message: "Cannot move user outside your branch" }, { status: 403 });
                    }
                }

                // 3. Role Check
                if (!currentUserRole) {
                    return NextResponse.json({ success: false, message: "Current user role not found" }, { status: 403 });
                }

                const roleToCheck = data.role ? data.role : targetUser.role;
                const hasUpdatePermission = currentUserRole.managedRoles?.some((mr: any) => {
                    const mrId = (mr.roleId?._id || mr.roleId)?.toString();
                    return mrId === roleToCheck.toString() && mr.permissions.includes("UPDATE");
                });

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

                // 1. Organization Check
                if (targetUser.organization?.toString() !== currentUser.organization?.toString()) {
                    return NextResponse.json({ success: false, message: "Cannot delete user outside your organization" }, { status: 403 });
                }

                // 2. Branch Check
                if (currentUser.branch) { // Current user is branch-level
                    if (targetUser.branch?.toString() !== currentUser.branch?.toString()) {
                        return NextResponse.json({ success: false, message: "Cannot delete user outside your branch" }, { status: 403 });
                    }
                }

                // 3. Role Check
                if (!currentUserRole) {
                    return NextResponse.json({ success: false, message: "Current user role not found" }, { status: 403 });
                }

                const hasDeletePermission = currentUserRole.managedRoles?.some((mr: any) => {
                    const mrId = (mr.roleId?._id || mr.roleId)?.toString();
                    return mrId === targetUser.role.toString() && mr.permissions.includes("DELETE");
                });

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
