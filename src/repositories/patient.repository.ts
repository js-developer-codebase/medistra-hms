import { Types } from "mongoose";
import Patient from "@/models/patient.model";
import { IPatient } from "@/interfaces/patient.interface";
import { CreatePatientDto, UpdatePatientDto, AddPatientDocumentDto } from "@/dto/patient.dto";

export class PatientRepository {
    async create(data: CreatePatientDto): Promise<IPatient> {
        return await new Patient(data).save();
    }

    async findAll(filter: any = {}): Promise<IPatient[]> {
        return await Patient.find(filter)
            .populate("branchId")
            .sort({ createdAt: -1 })
            .lean();
    }

    async findById(id: Types.ObjectId): Promise<IPatient | null> {
        return await Patient.findById(id)
            .populate("branchId")
            .populate("mergedWith", "name uhid contact")
            .lean();
    }

    async findByUhid(uhid: string): Promise<IPatient | null> {
        return await Patient.findOne({ uhid })
            .populate("branchId")
            .lean();
    }

    async findByBranchId(branchId: Types.ObjectId): Promise<IPatient[]> {
        return await Patient.find({ branchId, isMerged: { $ne: true } })
            .populate("branchId")
            .sort({ createdAt: -1 })
            .lean();
    }

    async search(params: {
        query?: string;
        branchId?: string;
        status?: string;
        bloodGroup?: string;
    }): Promise<IPatient[]> {
        const filter: any = {};

        if (params.query && params.query.trim()) {
            const regex = new RegExp(params.query.trim(), "i");
            filter.$or = [
                { name: regex },
                { contact: regex },
                { uhid: regex },
                { email: regex },
                { identificationNumber: regex }
            ];
        }

        if (params.branchId && Types.ObjectId.isValid(params.branchId)) {
            filter.branchId = new Types.ObjectId(params.branchId);
        }

        if (params.status === "active") {
            filter.isActive = true;
            filter.isMerged = { $ne: true };
        } else if (params.status === "inactive") {
            filter.isActive = false;
            filter.isMerged = { $ne: true };
        } else if (params.status === "merged") {
            filter.isMerged = true;
        }

        if (params.bloodGroup && params.bloodGroup !== "ALL") {
            filter.bloodGroup = params.bloodGroup;
        }

        return await Patient.find(filter)
            .populate("branchId")
            .sort({ createdAt: -1 })
            .lean();
    }

    async update(id: Types.ObjectId, data: UpdatePatientDto): Promise<IPatient | null> {
        return await Patient.findByIdAndUpdate(id, data, { new: true })
            .populate("branchId")
            .lean();
    }

    async delete(id: Types.ObjectId): Promise<IPatient | null> {
        return await Patient.findByIdAndDelete(id).lean();
    }

    async addDocument(id: Types.ObjectId, document: AddPatientDocumentDto): Promise<IPatient | null> {
        return await Patient.findByIdAndUpdate(
            id,
            {
                $push: {
                    documents: {
                        ...document,
                        uploadedAt: new Date()
                    }
                }
            },
            { new: true }
        )
            .populate("branchId")
            .lean();
    }

    async deleteDocument(id: Types.ObjectId, documentId: string): Promise<IPatient | null> {
        return await Patient.findByIdAndUpdate(
            id,
            {
                $pull: {
                    documents: { _id: new Types.ObjectId(documentId) }
                }
            },
            { new: true }
        )
            .populate("branchId")
            .lean();
    }

    async mergePatients(
        primaryId: Types.ObjectId,
        secondaryId: Types.ObjectId,
        reason: string
    ): Promise<{ primary: IPatient | null; secondary: IPatient | null }> {
        const secondary = await Patient.findById(secondaryId);
        if (!secondary) throw new Error("Secondary patient not found");

        const primary = await Patient.findById(primaryId);
        if (!primary) throw new Error("Primary patient not found");

        // Merge documents and history into primary
        const combinedDocs = [...(primary.documents || []), ...(secondary.documents || [])];
        const combinedHistory = Array.from(
            new Set([...(primary.medicalHistory || []), ...(secondary.medicalHistory || [])])
        );
        const combinedAllergies = Array.from(
            new Set([...(primary.allergies || []), ...(secondary.allergies || [])])
        );

        await Patient.findByIdAndUpdate(primaryId, {
            documents: combinedDocs,
            medicalHistory: combinedHistory,
            allergies: combinedAllergies
        });

        // Mark secondary as merged and deactivate
        await Patient.findByIdAndUpdate(secondaryId, {
            isMerged: true,
            mergedWith: primaryId,
            mergeReason: reason,
            isActive: false
        });

        const updatedPrimary = await this.findById(primaryId);
        const updatedSecondary = await this.findById(secondaryId);

        return { primary: updatedPrimary, secondary: updatedSecondary };
    }

    async getStats(branchId?: string) {
        const match: any = {};
        if (branchId && Types.ObjectId.isValid(branchId)) {
            match.branchId = new Types.ObjectId(branchId);
        }

        const totalPatients = await Patient.countDocuments({ ...match, isMerged: { $ne: true } });
        const activePatients = await Patient.countDocuments({ ...match, isActive: true, isMerged: { $ne: true } });
        const mergedPatients = await Patient.countDocuments({ ...match, isMerged: true });

        // Gender breakdown
        const genderStats = await Patient.aggregate([
            { $match: { ...match, isMerged: { $ne: true } } },
            { $group: { _id: "$gender", count: { $sum: 1 } } }
        ]);

        // Blood group breakdown
        const bloodStats = await Patient.aggregate([
            { $match: { ...match, isMerged: { $ne: true } } },
            { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
        ]);

        // Age group breakdown
        const ageStats = await Patient.aggregate([
            { $match: { ...match, isMerged: { $ne: true } } },
            {
                $bucket: {
                    groupBy: "$age",
                    boundaries: [0, 18, 35, 50, 65, 120],
                    default: "Other",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        return {
            totalPatients,
            activePatients,
            mergedPatients,
            genderStats,
            bloodStats,
            ageStats
        };
    }
}

export default new PatientRepository();

