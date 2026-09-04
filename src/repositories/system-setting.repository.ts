import { Types } from "mongoose";
import SystemSetting from "@/models/system-setting.model";
import { ISystemSetting } from "@/interfaces/system-setting.interface";

export class SystemSettingRepository {
    async create(data: any): Promise<ISystemSetting> {
        return await new SystemSetting(data).save();
    }

    async findAll(): Promise<ISystemSetting[]> {
        return await SystemSetting.find().lean();
    }

    async findByCategory(category: string): Promise<ISystemSetting[]> {
        return await SystemSetting.find({ category }).lean();
    }

    async bulkUpsert(category: string, settings: Array<{ key: string; value: string; description?: string }>): Promise<number> {
        if (!settings || settings.length === 0) return 0;
        const operations = settings.map((item) => ({
            updateOne: {
                filter: { key: item.key },
                update: {
                    $set: {
                        category,
                        key: item.key,
                        value: item.value,
                        ...(item.description ? { description: item.description } : {})
                    }
                },
                upsert: true
            }
        }));
        const result = await SystemSetting.bulkWrite(operations);
        return (result.modifiedCount || 0) + (result.upsertedCount || 0);
    }

    async update(id: Types.ObjectId, data: any): Promise<ISystemSetting | null> {
        return await SystemSetting.findByIdAndUpdate(id, data, { new: true }).lean();
    }

    async delete(id: Types.ObjectId): Promise<ISystemSetting | null> {
        return await SystemSetting.findByIdAndDelete(id).lean();
    }
}

export default new SystemSettingRepository();
