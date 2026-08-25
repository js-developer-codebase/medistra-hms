import { IAccess, IManagedRole } from "@/interfaces/role.interface";

export interface CreateRoleDto {
    role: string;
    access: IAccess[];
    managedRoles?: IManagedRole[];
}

export interface UpdateRoleDto {
    role?: string;
    access?: IAccess[];
    managedRoles?: IManagedRole[];
}
