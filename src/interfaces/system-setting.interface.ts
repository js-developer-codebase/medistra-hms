import { Document } from "mongoose";

export interface ISystemSetting extends Document {
    category: string;
    key: string;
    value: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
