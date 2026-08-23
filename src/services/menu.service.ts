import menuRepository, { MenuRepository } from "@/repositories/menu.repository";
import { Types } from "mongoose";
import { IMenu } from "@/interfaces/menu.interface";

export interface CreateMenuDTO {
    name: string;
    path?: string;
    icon?: string;
    children?: string[];
    parentId?: string;
}

export class MenuService {
    constructor(private repository: MenuRepository = menuRepository) { }

    async createMenu(dto: CreateMenuDTO): Promise<IMenu> {
        const { name, path, icon, children, parentId } = dto;

        // Validation: Name is required
        if (!name || typeof name !== "string" || !name.trim()) {
            const error: any = new Error("Menu name is required");
            error.statusCode = 400;
            throw error;
        }

        // Validate parentId format if provided
        if (parentId && !Types.ObjectId.isValid(parentId)) {
            const error: any = new Error("Invalid parentId format");
            error.statusCode = 400;
            throw error;
        }

        // Validate and convert children array
        const formattedChildren: Types.ObjectId[] = [];
        if (children && Array.isArray(children)) {
            for (const childId of children) {
                if (!Types.ObjectId.isValid(childId)) {
                    const error: any = new Error(`Invalid child ID format: ${childId}`);
                    error.statusCode = 400;
                    throw error;
                }
                formattedChildren.push(new Types.ObjectId(childId));
            }
        }

        // Verify parent menu existence if parentId is provided
        if (parentId) {
            const parentMenu = await this.repository.findById(parentId);
            if (!parentMenu) {
                const error: any = new Error("Parent menu not found");
                error.statusCode = 404;
                throw error;
            }
        }

        // Create the new menu item
        const newMenu = await this.repository.create({
            name: name.trim(),
            path: path ? String(path).trim() : "",
            icon: icon ? String(icon).trim() : "",
            children: formattedChildren
        });

        // Link to parent menu if parentId provided
        if (parentId) {
            await this.repository.addChildToParent(parentId, newMenu._id as Types.ObjectId);
        }

        return newMenu;
    }

    async getAllMenus(): Promise<IMenu[]> {
        return await this.repository.findAll();
    }

    async getMenuById(id: string): Promise<IMenu> {
        if (!id || !Types.ObjectId.isValid(id)) {
            const error: any = new Error("Invalid Menu ID format");
            error.statusCode = 400;
            throw error;
        }

        const menu = await this.repository.findById(id);

        if (!menu) {
            const error: any = new Error("Menu not found");
            error.statusCode = 404;
            throw error;
        }

        return menu;
    }
}

export default new MenuService();
