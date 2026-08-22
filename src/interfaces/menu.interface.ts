import { Document, Types } from "mongoose";

export interface IMenu extends Document {
    name: string,
    path: string,
    icon: string,
    children: Types.ObjectId[]
}