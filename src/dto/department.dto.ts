import { Types } from "mongoose";

export interface CreateDepartmentDto {
    name?: string;
    code: string;
    organizationId?: Types.ObjectId | string;
    headOfDepartment?: Types.ObjectId | string;
    location?: string;
    phoneExtension?: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateDepartmentDto {
    name?: string;
    code?: string;
    organizationId?: Types.ObjectId | string;
    headOfDepartment?: Types.ObjectId | string;
    location?: string;
    phoneExtension?: string;
    description?: string;
    isActive?: boolean;
}
