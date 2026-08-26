import { Types } from "mongoose";
import SecurityEvent from "@/models/security-event.model";
import { ISecurityEvent } from "@/interfaces/security-event.interface";

export class SecurityEventRepository {
    async create(data: any): Promise<ISecurityEvent> {
        return await new SecurityEvent(data).save();
    }

    async findAll(): Promise<ISecurityEvent[]> {
        return await SecurityEvent.find().populate("user").sort({ createdAt: -1 }).lean();
    }
}

export default new SecurityEventRepository();
