import { Types } from "mongoose";

export interface CreateDepartmentDto {
    name?: string; // Optional due to default in schema, but good to have in DTO
    code: string;
    organizationId: Types.ObjectId | string;
    isActive?: boolean;
}

export interface UpdateDepartmentDto {
    name?: string;
    code?: string;
    organizationId?: Types.ObjectId | string;
    isActive?: boolean;
}
