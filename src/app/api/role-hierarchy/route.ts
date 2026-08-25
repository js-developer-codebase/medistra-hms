import { NextRequest, NextResponse } from "next/server";
import roleHierarchyController from "@/controllers/role-hierarchy.controller";

/**
 * @route GET /api/role-hierarchy
 * @desc Get role hierarchies (optionally by parentRole query param)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    return roleHierarchyController.getHierarchies(request);
}

/**
 * @route POST /api/role-hierarchy
 * @desc Set hierarchies for a parent role
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    return roleHierarchyController.setHierarchies(request);
}
