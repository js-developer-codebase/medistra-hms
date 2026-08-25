import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import defaultMenuService, { MenuService } from "@/services/menu.service";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import Role from "@/models/role.model";

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

    async getMenus(request?: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            let menus = await this.service.getAllMenus();

            // Filter menus based on user role access
            const session = await getServerSession(authOptions);
            if (session && session.user) {
                const currentUser: any = session.user;
                if (currentUser.role) {
                    const roleDoc = await Role.findById(currentUser.role);
                    if (roleDoc && roleDoc.role !== "SUPER_ADMIN") {
                        const accessibleModules = roleDoc.access?.map((a: any) => a.moduleName) || [];
                        
                        // Filter the top-level menus and their children
                        menus = menus.map((menu: any) => {
                            const menuObj = menu.toObject ? menu.toObject() : { ...menu };
                            // If it has children, filter the children
                            if (menuObj.children && menuObj.children.length > 0) {
                                menuObj.children = menuObj.children.filter((child: any) => 
                                    accessibleModules.includes(child.name) || accessibleModules.includes(menuObj.name)
                                );
                            }
                            return menuObj;
                        }).filter((menu: any) => {
                            // Keep if they have direct access, OR if they have access to at least one of its children
                            const hasDirectAccess = accessibleModules.includes(menu.name);
                            const hasChildAccess = menu.children && menu.children.length > 0;
                            return hasDirectAccess || hasChildAccess;
                        });
                    }
                }
            }

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
