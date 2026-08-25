import { Document, Types } from "mongoose";
import { IRole } from "./role.interface";

export type RolePermissionType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

export interface IRoleHierarchy extends Document {
    parentRole: Types.ObjectId | IRole;
    targetRole: Types.ObjectId | IRole;
    permissions: RolePermissionType[];
    createdAt?: Date;
    updatedAt?: Date;
}
