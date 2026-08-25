import { Document } from "mongoose";

export interface IManagedRole {
    roleId: Document['_id'];
    permissions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE')[];
}

export interface IRole extends Document {
    role: string;
    access: IAccess[];
    managedRoles: IManagedRole[];
}
export interface IAccess {
    moduleName: string;
    permissions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE')[];
}