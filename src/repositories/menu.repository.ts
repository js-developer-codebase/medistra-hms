import Menu from "@/models/menu.model";
import { IMenu } from "@/interfaces/menu.interface";
import { Types } from "mongoose";
import { promises } from "dns";

export class MenuRepository {
    async create(data: { name: string; path?: string; icon?: string; children?: Types.ObjectId[] }): Promise<IMenu> {
        return await Menu.create(data);
    }

    async findById(id: string | Types.ObjectId): Promise<IMenu | null> {
        return await Menu.findById(id).populate("children").lean();
    }

    async findByName(name: string): Promise<IMenu | null> {
        return await Menu.findOne({ name }).populate("children").lean();
    }

    async findByPath(path: string): Promise<IMenu | null> {
        return await Menu.findOne({ path }).populate("children").lean();
    }

    async addChildToParent(parentId: string | Types.ObjectId, childId: Types.ObjectId): Promise<IMenu | null> {
        return await Menu.findByIdAndUpdate(
            parentId,
            { $addToSet: { children: childId } },
            { new: true }
        );
    }

    async findAll(): Promise<IMenu[]> {
        return await Menu.find().populate("children").lean();
    }
}

export default new MenuRepository();
