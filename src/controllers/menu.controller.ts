import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import defaultMenuService, { MenuService } from "@/services/menu.service";

export class MenuController {
    constructor(private service: MenuService = defaultMenuService) { }

    async createMenu(request: NextRequest) {
        try {
            await dbConnect();
            const body = await request.json();
            const existingMenu = await this.service.findByName(body.name);

            if (existingMenu) {
                const error: any = new Error("Menu already exists");
                error.statusCode = 400;
                throw error;
            }

            const existingPath = await this.service.findByPath(body.path);

            if (existingPath) {
                const error: any = new Error("Menu path already exists");
                error.statusCode = 400;
                throw error;
            }
            return await this.service.createMenu(body);
        } catch (error: any) {
            return NextResponse.json(
                {
                    success: false,
                    message: error?.message || "Failed to create menu"
                },
                { status: 500 }
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
