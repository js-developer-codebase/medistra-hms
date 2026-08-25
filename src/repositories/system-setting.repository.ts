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

    async update(id: Types.ObjectId, data: any): Promise<ISystemSetting | null> {
        return await SystemSetting.findByIdAndUpdate(id, data, { new: true }).lean();
    }

    async delete(id: Types.ObjectId): Promise<ISystemSetting | null> {
        return await SystemSetting.findByIdAndDelete(id).lean();
    }
}

export default new SystemSettingRepository();
