import { Document, Types } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    gender: string;
    avatar?: string;
    phone?: string;
    role: Types.ObjectId;
    organization: Types.ObjectId;
    branch?: Types.ObjectId;
    isActive: boolean;
    lastLoginAt?: Date;
}