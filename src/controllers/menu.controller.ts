import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import menuService, { MenuService } from "@/services/menu.service";

export class MenuController {
    constructor(private service: MenuService = menuService) {}

    async createMenu(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const body = await request.json();

            const newMenu = await this.service.createMenu(body);

            return NextResponse.json(
                {
                    success: true,
                    message: "Menu created successfully",
                    data: newMenu
                },
                { status: 201 }
            );
        } catch (error: any) {
            console.error("MenuController createMenu Error:", error);

            const statusCode = error?.statusCode || 500;

            return NextResponse.json(
                {
                    success: false,
                    message: error?.message || "Failed to create menu"
                },
                { status: statusCode }
            );
        }
    }

    async getMenus(): Promise<NextResponse> {
        try {
            await dbConnect();
            const menus = await this.service.getAllMenus();

            return NextResponse.json(
                {
                    success: true,
                    count: menus.length,
                    data: menus
                },
                { status: 200 }
            );
        } catch (error: any) {
            console.error("MenuController getMenus Error:", error);

            const statusCode = error?.statusCode || 500;

            return NextResponse.json(
                {
                    success: false,
                    message: error?.message || "Failed to fetch menus"
                },
                { status: statusCode }
            );
        }
    }

    async getMenuById(
        request: NextRequest,
        { params }: { params: Promise<{ id: string }> }
    ): Promise<NextResponse> {
        try {
            await dbConnect();
            const { id } = await params;

            const menu = await this.service.getMenuById(id);

            return NextResponse.json(
                {
                    success: true,
                    data: menu
                },
                { status: 200 }
            );
        } catch (error: any) {
            console.error("MenuController getMenuById Error:", error);

            const statusCode = error?.statusCode || 500;

            return NextResponse.json(
                {
                    success: false,
                    message: error?.message || "Failed to fetch menu"
                },
                { status: statusCode }
            );
        }
    }
}

export default new MenuController();
