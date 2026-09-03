import { Types } from "mongoose";
import Admission from "@/models/admission.model";
import "@/models/patient.model";
import "@/models/user.model";
import "@/models/bed.model";
import "@/models/room.model";
import "@/models/ward.model";
import "@/models/organization.model";
import { IAdmission } from "@/interfaces/admission.interface";
import { CreateAdmissionDto, UpdateAdmissionDto } from "@/dto/admission.dto";

const defaultPopulate = [
    { path: "patientId" },
    { path: "doctorId", select: "-password" },
    { path: "branchId" },
    {
        path: "bedId",
        populate: {
            path: "roomId",
            populate: { path: "wardId" }
        }
    },
    {
        path: "transferHistory.fromBedId",
        populate: {
            path: "roomId",
            populate: { path: "wardId" }
        }
    },
    {
        path: "transferHistory.toBedId",
        populate: {
            path: "roomId",
            populate: { path: "wardId" }
        }
    },
    { path: "transferHistory.fromDoctorId", select: "name email" },
    { path: "transferHistory.toDoctorId", select: "name email" }
];

export class AdmissionRepository {
    async create(data: CreateAdmissionDto): Promise<IAdmission> {
        const doc = await new Admission(data).save();
        return await this.findById(doc._id) as IAdmission;
    }

    async findAll(filter: any = {}): Promise<IAdmission[]> {
        return await Admission.find(filter)
            .populate(defaultPopulate)
            .sort({ admissionDate: -1 })
            .lean();
    }

    async findById(id: Types.ObjectId): Promise<IAdmission | null> {
        return await Admission.findById(id)
            .populate(defaultPopulate)
            .lean();
    }

    async findActive(): Promise<IAdmission[]> {
        return await Admission.find({ status: { $in: ["ADMITTED", "TRANSFERRED"] } })
            .populate(defaultPopulate)
            .sort({ admissionDate: -1 })
            .lean();
    }

    async findDischarged(): Promise<IAdmission[]> {
        return await Admission.find({ status: "DISCHARGED" })
            .populate(defaultPopulate)
            .sort({ dischargeDate: -1 })
            .lean();
    }

    async findByPatientId(patientId: Types.ObjectId): Promise<IAdmission[]> {
        return await Admission.find({ patientId })
            .populate(defaultPopulate)
            .sort({ admissionDate: -1 })
            .lean();
    }

    async findByDoctorId(doctorId: Types.ObjectId): Promise<IAdmission[]> {
        return await Admission.find({ doctorId })
            .populate(defaultPopulate)
            .sort({ admissionDate: -1 })
            .lean();
    }

    async findByBranchId(branchId: Types.ObjectId): Promise<IAdmission[]> {
        return await Admission.find({ branchId })
            .populate(defaultPopulate)
            .sort({ admissionDate: -1 })
            .lean();
    }
    
    async findByBedId(bedId: Types.ObjectId): Promise<IAdmission[]> {
        return await Admission.find({ bedId })
            .populate(defaultPopulate)
            .sort({ admissionDate: -1 })
            .lean();
    }

    async update(id: Types.ObjectId, data: UpdateAdmissionDto | any): Promise<IAdmission | null> {
        return await Admission.findByIdAndUpdate(id, data, { new: true })
            .populate(defaultPopulate)
            .lean();
    }

    async delete(id: Types.ObjectId): Promise<IAdmission | null> {
        return await Admission.findByIdAndDelete(id).lean();
    }
}

export default new AdmissionRepository();
