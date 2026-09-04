import systemSettingRepository, { SystemSettingRepository } from "@/repositories/system-setting.repository";
import { Types } from "mongoose";

export class ConfigService {
    constructor(private repo: SystemSettingRepository = systemSettingRepository) { }

    async getSettings(category?: string) {
        if (category) {
            return await this.repo.findByCategory(category);
        }
        return await this.repo.findAll();
    }

    async getSettingsByCategory(category: string) {
        return await this.repo.findByCategory(category);
    }

    async getSettingsMap(category: string): Promise<Record<string, string>> {
        const settings = await this.repo.findByCategory(category);
        const map: Record<string, string> = {};
        for (const s of settings) {
            map[s.key] = s.value;
        }
        return map;
    }

    async bulkUpdateSettings(category: string, settings: Array<{ key: string; value: string; description?: string }>) {
        if (!category) {
            throw { statusCode: 400, message: "Category is required" };
        }
        if (!Array.isArray(settings)) {
            throw { statusCode: 400, message: "Settings must be an array of key-value pairs" };
        }
        const updatedCount = await this.repo.bulkUpsert(category, settings);
        return { success: true, count: updatedCount, category };
    }

    async getConfigStats() {
        const all = await this.repo.findAll();
        const categoryCounts: Record<string, number> = {};
        let latestUpdate = new Date(0);

        for (const s of all) {
            categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
            if (s.updatedAt && new Date(s.updatedAt) > latestUpdate) {
                latestUpdate = new Date(s.updatedAt);
            }
        }

        const expectedCategories = [
            "general", "localization", "currency", "timezone", "numbering",
            "appointments", "billing", "clinical", "laboratory", "pharmacy",
            "notifications", "integrations", "api"
        ];

        const configuredCount = expectedCategories.filter(cat => (categoryCounts[cat] || 0) > 0).length;

        return {
            totalSettings: all.length,
            configuredCategories: configuredCount,
            totalCategories: expectedCategories.length,
            categoryCounts,
            lastSynchronized: latestUpdate.getTime() > 0 ? latestUpdate.toISOString() : new Date().toISOString(),
            status: configuredCount === expectedCategories.length ? "HEALTHY" : "NEEDS_CONFIGURATION",
            integrityScore: Math.round((configuredCount / expectedCategories.length) * 100)
        };
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
