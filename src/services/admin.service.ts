import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import Role from "@/models/role.model";
import UserSession, { IUserSession } from "@/models/user-session.model";
import AccessPolicy, { IAccessPolicy } from "@/models/access-policy.model";
import Organization from "@/models/organization.model";
import mongoose from "mongoose";

// Ensure models are registered
const _ensureModels = () => {
  if (!mongoose.models.User && User) {}
  if (!mongoose.models.Role && Role) {}
  if (!mongoose.models.UserSession && UserSession) {}
  if (!mongoose.models.AccessPolicy && AccessPolicy) {}
  if (!mongoose.models.Organization && Organization) {}
};

export class AdminService {
  /**
   * Executive Administration Summary KPIs
   */
  static async getAdminSummaryStats() {
    await dbConnect();
    _ensureModels();

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalRoles,
      activeSessions,
      terminatedSessions,
      policies,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      Role.countDocuments(),
      UserSession.countDocuments({ status: "ACTIVE" }),
      UserSession.countDocuments({ status: "TERMINATED" }),
      this.getAccessPolicies(),
      User.find()
        .populate("role", "role")
        .populate("organization", "organizationName")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalRoles,
      activeSessions,
      terminatedSessions,
      policies,
      recentUsers,
    };
  }

  /**
   * User Sessions Register & Management
   */
  static async getUserSessions(filters?: { status?: string; search?: string }) {
    await dbConnect();
    _ensureModels();

    const query: any = {};
    if (filters?.status && filters.status !== "ALL") {
      query.status = filters.status;
    }

    let sessions = await UserSession.find(query)
      .populate({
        path: "userId",
        select: "name email role organization branch",
        populate: { path: "role", select: "role" },
      })
      .sort({ lastActiveAt: -1 })
      .lean();

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      sessions = sessions.filter((s: any) => {
        const userName = s.userId?.name?.toLowerCase() || "";
        const userEmail = s.userId?.email?.toLowerCase() || "";
        const ip = s.ipAddress?.toLowerCase() || "";
        const browser = s.browser?.toLowerCase() || "";
        return (
          userName.includes(q) ||
          userEmail.includes(q) ||
          ip.includes(q) ||
          browser.includes(q)
        );
      });
    }

    return sessions;
  }

  /**
   * Terminate Specific Session
   */
  static async terminateSession(sessionId: string) {
    await dbConnect();
    _ensureModels();

    const updated = await UserSession.findByIdAndUpdate(
      sessionId,
      { status: "TERMINATED", lastActiveAt: new Date() },
      { new: true }
    );
    if (!updated) throw new Error("Session not found");
    return updated;
  }

  /**
   * Terminate All Stale / Inactive Sessions
   */
  static async terminateAllStaleSessions() {
    await dbConnect();
    _ensureModels();

    // Terminate all sessions older than 12 hours or inactive
    const threshold = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const result = await UserSession.updateMany(
      { status: "ACTIVE", lastActiveAt: { $lt: threshold } },
      { status: "EXPIRED" }
    );

    return result;
  }

  /**
   * System Permissions Matrix Across All Roles and Modules
   */
  static async getPermissionsMatrix() {
    await dbConnect();
    _ensureModels();

    const standardModules = [
      "Dashboard",
      "Patient Management",
      "Doctor & Staff Management",
      "Appointments",
      "Clinical Care",
      "Inpatient & Admissions",
      "Operation Theatre",
      "Laboratory",
      "Radiology",
      "Pharmacy",
      "Blood Bank",
      "Inventory",
      "Procurement",
      "Finance & Billing",
      "Insurance & TPA",
      "Notifications",
      "Staff & HR",
      "Administration",
      "Organization Management",
      "Audit & Compliance",
      "Reports & Analytics",
    ];

    const roles = await Role.find().sort({ role: 1 }).lean();

    const matrix = roles.map((r: any) => {
      const accessMap: Record<string, string[]> = {};
      (r.access || []).forEach((acc: any) => {
        accessMap[acc.moduleName] = acc.permissions || [];
      });

      return {
        _id: r._id,
        role: r.role,
        isSuperAdmin: r.role === "SYSTEM_SUPER_ADMIN",
        access: accessMap,
      };
    });

    return {
      modules: standardModules,
      roles: matrix,
    };
  }

  /**
   * Role Assignments & Governance
   */
  static async getUserAssignments(filters?: { roleId?: string; search?: string }) {
    await dbConnect();
    _ensureModels();

    const query: any = {};
    if (filters?.roleId && filters.roleId !== "ALL") {
      query.role = filters.roleId;
    }

    if (filters?.search) {
      const regex = new RegExp(filters.search, "i");
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const users = await User.find(query)
      .populate("role", "role access")
      .populate("organization", "organizationName")
      .populate("branch", "organizationName")
      .sort({ name: 1 })
      .lean();

    const roles = await Role.find().select("role").sort({ role: 1 }).lean();

    return { users, roles };
  }

  /**
   * Update Single User Role
   */
  static async updateUserRole(userId: string, roleId: string) {
    await dbConnect();
    _ensureModels();

    const user = await User.findByIdAndUpdate(userId, { role: roleId }, { new: true })
      .populate("role", "role")
      .lean();

    if (!user) throw new Error("User not found");
    return user;
  }

  /**
   * Bulk Reassign Roles
   */
  static async bulkAssignRoles(userIds: string[], roleId: string) {
    await dbConnect();
    _ensureModels();

    const result = await User.updateMany(
      { _id: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) } },
      { role: new mongoose.Types.ObjectId(roleId) }
    );

    return result;
  }

  /**
   * Access & Security Policies
   */
  static async getAccessPolicies() {
    await dbConnect();
    _ensureModels();

    let policy = await AccessPolicy.findOne().lean();
    if (!policy) {
      policy = await AccessPolicy.create({
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        passwordExpiryDays: 90,
        sessionTimeoutMinutes: 30,
        maxConcurrentSessions: 3,
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 15,
        mfaPolicy: "ADMIN_ONLY",
        ipWhitelist: ["192.168.1.0/24", "10.0.0.0/16", "127.0.0.1"],
        auditLevel: "DETAILED",
      });
    }

    return policy as IAccessPolicy;
  }

  static async updateAccessPolicies(data: Partial<IAccessPolicy>) {
    await dbConnect();
    _ensureModels();

    let policy = await AccessPolicy.findOne();
    if (!policy) {
      policy = await AccessPolicy.create(data);
    } else {
      Object.assign(policy, data);
      await policy.save();
    }

    return policy;
  }
}
