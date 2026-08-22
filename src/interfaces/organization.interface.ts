import { Document, Types } from "mongoose";
export interface IOrganization extends Document {
    organizationName: string;
    organizationId: string,
    organizationType: ('HOSPITAL' | 'CLINIC' | 'PHARMACY');
    headQuarter?: Types.ObjectId;
    branchType: ('MAIN' | 'BRANCH');
    email?: string;
    phone?: string;
    address?: string;
    logo?: string;
    isActive: boolean;
}