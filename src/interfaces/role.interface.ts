import { Document } from "mongoose";

export interface IRole extends Document {
    role: string;
    access: IAccess[];
}
export interface IAccess {
    moduleName: string;
    permissions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE')[];
}