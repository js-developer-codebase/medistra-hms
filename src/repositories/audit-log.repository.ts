import { Types } from "mongoose";
import AuditLog from "@/models/audit-log.model";
import { IAuditLog } from "@/interfaces/audit-log.interface";

export class AuditLogRepository {
    async create(data: any): Promise<IAuditLog> {
        return await new AuditLog(data).save();
    }

    async findAll(): Promise<IAuditLog[]> {
        return await AuditLog.find().populate("user").sort({ createdAt: -1 }).lean();
    }
}

export default new AuditLogRepository();
