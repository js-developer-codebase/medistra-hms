import mongoose, { Schema } from "mongoose";
import { ISystemSetting } from "@/interfaces/system-setting.interface";

const systemSettingSchema = new Schema<ISystemSetting>({
    category: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    description: { type: String }
}, { timestamps: true });

const SystemSetting = mongoose.models.SystemSetting || mongoose.model<ISystemSetting>("SystemSetting", systemSettingSchema);
export default SystemSetting;
