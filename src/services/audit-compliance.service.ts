import dbConnect from "@/lib/dbConnect";
import AuditLog from "@/models/audit-log.model";
import SecurityEvent from "@/models/security-event.model";
import ComplianceReport from "@/models/compliance-report.model";
import User from "@/models/user.model";
import Patient from "@/models/patient.model";

export interface LogFilterOptions {
  category?: string;
  severity?: string;
  status?: string;
  entity?: string;
  userId?: string;
  search?: string;
  limit?: number;
  skip?: number;
  startDate?: string;
  endDate?: string;
}

export class AuditComplianceService {
  async getTelemetryStats() {
    await dbConnect();

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      logs24h,
      userActivitiesCount,
      loginEventsCount,
      failedLoginsCount,
      sensitiveDataAccessCount,
      recordChangesCount,
      securityEventsCount,
      openSecurityAlerts,
      deletedRecordsCount,
      complianceReports,
      recentLogs,
    ] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }),
      AuditLog.countDocuments({ category: "USER_ACTIVITY" }),
      AuditLog.countDocuments({ category: "LOGIN" }),
      AuditLog.countDocuments({ category: "LOGIN", status: { $in: ["FAILURE", "BLOCKED"] } }),
      AuditLog.countDocuments({ category: "DATA_ACCESS" }),
      AuditLog.countDocuments({ category: "RECORD_CHANGE" }),
      SecurityEvent.countDocuments(),
      SecurityEvent.countDocuments({ status: { $in: ["DETECTED", "INVESTIGATING"] } }),
      AuditLog.countDocuments({ category: "DELETION" }),
      ComplianceReport.find().lean(),
      AuditLog.find()
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    const complianceScoreAvg =
      complianceReports.length > 0
        ? Math.round(
            complianceReports.reduce((acc: number, r: any) => acc + (r.overallScore || 0), 0) /
              complianceReports.length
          )
        : 94;

    return {
      totalLogs,
      logs24h,
      userActivitiesCount,
      loginEventsCount,
      failedLoginsCount,
      sensitiveDataAccessCount,
      recordChangesCount,
      securityEventsCount,
      openSecurityAlerts,
      deletedRecordsCount,
      complianceScoreAvg,
      recentLogs,
    };
  }

  async getLogs(options: LogFilterOptions = {}) {
    await dbConnect();
    const query: any = {};

    if (options.category && options.category !== "ALL") {
      query.category = options.category;
    }
    if (options.severity && options.severity !== "ALL") {
      query.severity = options.severity;
    }
    if (options.status && options.status !== "ALL") {
      query.status = options.status;
    }
    if (options.entity && options.entity !== "ALL") {
      query.entity = options.entity;
    }
    if (options.userId) {
      query.user = options.userId;
    }
    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) query.createdAt.$gte = new Date(options.startDate);
      if (options.endDate) {
        const end = new Date(options.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    if (options.search) {
      const regex = new RegExp(options.search, "i");
      query.$or = [
        { action: regex },
        { entity: regex },
        { details: regex },
        { userName: regex },
        { ipAddress: regex },
      ];
    }

    const limit = options.limit || 50;
    const skip = options.skip || 0;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("user", "name email role")
        .populate("patientId", "firstName lastName uhid")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return { logs, total, limit, skip };
  }

  async createLog(data: any) {
    await dbConnect();
    return await AuditLog.create(data);
  }

  async getUserActivities(options: LogFilterOptions = {}) {
    return this.getLogs({
      ...options,
      category: "USER_ACTIVITY",
    });
  }

  async getLoginHistory(options: LogFilterOptions = {}) {
    return this.getLogs({
      ...options,
      category: "LOGIN",
    });
  }

  async getDataAccessLogs(options: LogFilterOptions = {}) {
    return this.getLogs({
      ...options,
      category: "DATA_ACCESS",
    });
  }

  async getRecordChanges(options: LogFilterOptions = {}) {
    return this.getLogs({
      ...options,
      category: "RECORD_CHANGE",
    });
  }

  async getDeletedRecords(options: LogFilterOptions = {}) {
    return this.getLogs({
      ...options,
      category: "DELETION",
    });
  }

  async getSecurityEvents(options: { severity?: string; status?: string; search?: string } = {}) {
    await dbConnect();
    const query: any = {};

    if (options.severity && options.severity !== "ALL") {
      query.severity = options.severity;
    }
    if (options.status && options.status !== "ALL") {
      query.status = options.status;
    }
    if (options.search) {
      const regex = new RegExp(options.search, "i");
      query.$or = [
        { eventType: regex },
        { details: regex },
        { userName: regex },
        { ipAddress: regex },
      ];
    }

    const events = await SecurityEvent.find(query)
      .populate("user", "name email role")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return events;
  }

  async createSecurityEvent(data: any) {
    await dbConnect();
    return await SecurityEvent.create(data);
  }

  async resolveSecurityEvent(id: string, resolutionNotes: string, resolvedBy?: string) {
    await dbConnect();
    const updateData: any = {
      status: "RESOLVED",
      resolutionNotes,
      resolvedAt: new Date(),
    };
    if (resolvedBy) {
      updateData.resolvedBy = resolvedBy;
    }

    return await SecurityEvent.findByIdAndUpdate(id, updateData, { new: true })
      .populate("user", "name email role")
      .populate("resolvedBy", "name email")
      .lean();
  }

  async getComplianceReports(framework?: string) {
    await dbConnect();
    const query: any = {};
    if (framework && framework !== "ALL") {
      query.framework = framework;
    }

    return await ComplianceReport.find(query).sort({ auditDate: -1 }).lean();
  }

  async createComplianceReport(data: any) {
    await dbConnect();
    return await ComplianceReport.create(data);
  }
}

export default new AuditComplianceService();
