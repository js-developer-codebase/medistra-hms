import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import defaultRoleService, { RoleService } from "@/services/role.service";
import { CreateRoleDto, UpdateRoleDto } from "@/dto/role.dto";

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
            const roles = await this.roleService.getAllRoles();

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
