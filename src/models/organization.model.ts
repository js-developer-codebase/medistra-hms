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
            enum: ['HOSPITAL', 'CLINIC', 'PHARMACY', 'DIAGNOSTIC'],
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
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        pincode: {
            type: String,
        },
        country: {
            type: String,
            default: "India",
        },
        capacity: {
            type: Number,
            default: 0,
        },
        logo: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        }
    }, { timestamps: true })

const Organization = mongoose.models.Organization || mongoose.model<IOrganization>('Organization', organizationSchema);
if (!mongoose.models.Branch) {
    mongoose.model('Branch', organizationSchema);
}
export default Organization;