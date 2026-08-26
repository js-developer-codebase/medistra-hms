import mongoose, { Schema, Types } from "mongoose";
import { IOrganization } from "@/interfaces/organization.interface";


const organizationSchema = new Schema<IOrganization>(
    {
        organizationName: {
            type: String,
            required: true
        },
        organizationId: {
            type: String,
            required: true
        },
        organizationType: {
            type: String,
            enum: ['HOSPITAL', 'CLINIC', 'PHARMACY'],
            required: true
        },
        headQuarter: {
            type: Types.ObjectId,
            ref: 'Organization'
        },
        branchType: {
            type: String,
            enum: ['MAIN', 'BRANCH'],
            default: "MAIN",
            required: true
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
        },
        address: {
            type: String,
        },
        logo: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, { timestamps: true })

const Organization = mongoose.models.Organization || mongoose.model<IOrganization>('Organization', organizationSchema);
if (!mongoose.models.Branch) {
    mongoose.model('Branch', organizationSchema);
}
export default Organization;