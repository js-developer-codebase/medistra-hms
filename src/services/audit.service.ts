import auditLogRepository, { AuditLogRepository } from "@/repositories/audit-log.repository";
import securityEventRepository, { SecurityEventRepository } from "@/repositories/security-event.repository";

export class AuditService {
    constructor(
        private auditRepo: AuditLogRepository = auditLogRepository,
        private securityRepo: SecurityEventRepository = securityEventRepository
    ) { }

    async getAuditLogs() {
        return await this.auditRepo.findAll();
    }

    async getSecurityEvents() {
        return await this.securityRepo.findAll();
    }
}

export default new AuditService();
