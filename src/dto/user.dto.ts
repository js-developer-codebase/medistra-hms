import { Types } from "mongoose";

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    gender: string;
    avatar?: string;
    photoId?: string;
    phone?: string;
    role: Types.ObjectId | string;
    organization?: Types.ObjectId | string;
    branch?: Types.ObjectId | string;
    isActive?: boolean;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    gender?: string;
    avatar?: string;
    photoId?: string;
    phone?: string;
    role?: Types.ObjectId | string;
    organization?: Types.ObjectId | string;
    branch?: Types.ObjectId | string;
    isActive?: boolean;
}
