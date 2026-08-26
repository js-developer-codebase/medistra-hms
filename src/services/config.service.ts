import systemSettingRepository, { SystemSettingRepository } from "@/repositories/system-setting.repository";
import { Types } from "mongoose";

export class ConfigService {
    constructor(private repo: SystemSettingRepository = systemSettingRepository) { }

    async getSettings() {
        return await this.repo.findAll();
    }

    async createSetting(data: any) {
        return await this.repo.create(data);
    }

    async updateSetting(id: Types.ObjectId, data: any) {
        const setting = await this.repo.update(id, data);
        if (!setting) {
            throw { statusCode: 404, message: "Setting not found" };
        }
        return setting;
    }

    async deleteSetting(id: Types.ObjectId) {
        const setting = await this.repo.delete(id);
        if (!setting) {
            throw { statusCode: 404, message: "Setting not found" };
        }
        return setting;
    }
}

export default new ConfigService();
