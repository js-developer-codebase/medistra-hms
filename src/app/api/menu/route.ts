import { NextRequest } from "next/server";
import menuController from "@/controllers/menu.controller";

/**
 * @route POST /api/menu
 * @desc Create a new menu item
 */
export async function POST(request: NextRequest) {
    return menuController.createMenu(request);
}

/**
 * @route GET /api/menu
 * @desc Get all menus
 */
export async function GET() {
    return menuController.getMenus();
}
