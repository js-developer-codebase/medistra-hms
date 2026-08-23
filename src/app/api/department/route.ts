import { NextRequest, NextResponse } from "next/server";
import DepartmentController from "@/controllers/department.controller";

/**
 * @route POST /api/department
 * @desc Create a new department
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return DepartmentController.createDepartment(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create department"
        }, { status: 500 });
    }
}

/**
 * @route GET /api/department
 * @desc Get all departments (supports ?organizationId=...)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return DepartmentController.getDepartments(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch departments"
        }, { status: 500 });
    }
}
