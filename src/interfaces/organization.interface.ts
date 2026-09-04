import { Document, Types } from "mongoose";
export interface IOrganization extends Document {
    organizationName: string;
    organizationId: string;
    organizationType: ('HOSPITAL' | 'CLINIC' | 'PHARMACY' | 'DIAGNOSTIC');
    headQuarter?: Types.ObjectId;
    branchType: ('MAIN' | 'BRANCH');
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    capacity?: number;
    logo?: string;
    isActive: boolean;
    metadata?: Record<string, any>;
}