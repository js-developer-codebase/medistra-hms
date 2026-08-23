import { NextRequest, NextResponse } from "next/server";
import menuController from "@/controllers/menu.controller";

/**
 * @route POST /api/menu
 * @desc Create a new menu item
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const newMenu = await menuController.createMenu(request);
        return NextResponse.json(
            {
                success: true,
                message: "Menu created successfully",
                data: newMenu
            },
            { status: 201 }
        );
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create menu"
        }, { status: 500 });
    }
}

/**
 * @route GET /api/menu
 * @desc Get all menus
 */
export async function GET() {
    try {
        return menuController.getMenus();
    } catch (e) {
        console.log(e);
        return Response.json({ error: e }, { status: 500 });
    }
}
