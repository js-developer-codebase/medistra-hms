import { IAccess } from "@/interfaces/role.interface";

export interface CreateRoleDto {
    role: string;
    access: IAccess[];
}

export interface UpdateRoleDto {
    role?: string;
    access?: IAccess[];
}
