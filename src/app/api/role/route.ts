import { NextRequest, NextResponse } from "next/server";
import RoleController from "@/controllers/role.controller";

/**
 * @route POST /api/role
 * @desc Create a new role
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return RoleController.createRole(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create role"
        }, { status: 500 });
    }
}

/**
 * @route GET /api/role
 * @desc Get all roles
 */
export async function GET(): Promise<NextResponse> {
    try {
        return RoleController.getRoles();
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch roles"
        }, { status: 500 });
    }
}
