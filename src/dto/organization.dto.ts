import { Types } from "mongoose"
export interface CreateOrganizationDto {
    organizationName: string,
    organizationId: string,
    organizationType: string,
    headQuarter?: Types.ObjectId,
    branchType: string,
    email: string,
    phone: string,
    address: string,
    logo?: string
}