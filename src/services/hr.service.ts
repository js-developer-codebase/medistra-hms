import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import Staff from "@/models/staff.model";
import Doctor from "@/models/doctor.model";
import Department from "@/models/department.model";
import Designation from "@/models/designation.model";
import Shift from "@/models/shift.model";
import Attendance from "@/models/attendance.model";
import Leave from "@/models/leave.model";
import StaffDocument from "@/models/staff-document.model";
import Role from "@/models/role.model";
import bcrypt from "bcryptjs";

export class HRService {
  private async ensureConnection() {
    await dbConnect();
    // Pre-register schemas for Mongoose population
    if (!User) {}
    if (!Staff) {}
    if (!Department) {}
    if (!Designation) {}
    if (!Shift) {}
    if (!Attendance) {}
    if (!Leave) {}
    if (!StaffDocument) {}
    if (!Doctor) {}
    if (!Role) {}
  }

  // 1. Executive HR Summary & Dashboard KPIs
  async getHRSummaryStats() {
    await this.ensureConnection();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalStaff,
      totalDoctors,
      onLeaveStaff,
      todayAttendance,
      pendingLeaves,
      expiringDocuments,
      activeShifts,
      departmentsCount,
      allStaffSalaries
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Staff.countDocuments(),
      Doctor.countDocuments({ status: "ACTIVE" }),
      Leave.countDocuments({
        status: "APPROVED",
        startDate: { $lte: todayEnd },
        endDate: { $gte: todayStart }
      }),
      Attendance.find({ date: { $gte: todayStart, $lte: todayEnd } }).lean(),
      Leave.countDocuments({ status: "PENDING" }),
      StaffDocument.countDocuments({
        expiryDate: { $exists: true, $ne: null, $lte: thirtyDaysFromNow }
      }),
      Shift.countDocuments({ status: { $in: ["SCHEDULED", "ONGOING"] } }),
      Department.countDocuments({ isActive: true }),
      Staff.find().select("salary").lean()
    ]);

    // Monthly Payroll Commitment in ₹
    const baseStaffPayroll = allStaffSalaries.reduce(
      (acc, s: any) => acc + (Number(s.salary) || 35000),
      0
    );
    // Doctor estimated retainers in ₹ (e.g. ₹1,20,000 per active doctor)
    const doctorPayroll = totalDoctors * 120000;
    const totalMonthlyPayroll = baseStaffPayroll + doctorPayroll;

    // Attendance calculations
    const totalEligible = Math.max(1, totalStaff + totalDoctors);
    const presentToday = todayAttendance.filter((a: any) => a.status === "PRESENT" || a.status === "LATE").length;
    const attendanceRate = Math.min(100, Math.round((presentToday / totalEligible) * 100));

    return {
      totalEmployees: totalStaff + totalDoctors,
      activeStaff: totalStaff,
      activeDoctors: totalDoctors,
      totalUsers,
      onLeaveToday: onLeaveStaff,
      presentToday,
      attendanceRate: `${attendanceRate}%`,
      monthlyPayrollLiability: totalMonthlyPayroll,
      pendingLeaveRequests: pendingLeaves,
      expiringDocumentsCount: expiringDocuments,
      activeShiftsCount: activeShifts,
      departmentsCount
    };
  }

  // 2. Employee Management
  async getEmployees(filter: { departmentId?: string; role?: string; search?: string; status?: string } = {}) {
    await this.ensureConnection();

    const query: any = {};
    if (filter.departmentId && Types.ObjectId.isValid(filter.departmentId)) {
      query.departmentId = filter.departmentId;
    }
    if (filter.role && filter.role !== "ALL") {
      query.role = filter.role;
    }
    if (filter.status && filter.status !== "ALL") {
      query.status = filter.status;
    }

    let staffMembers = await Staff.find(query)
      .populate("userId", "-password")
      .populate("departmentId")
      .populate("designationId")
      .sort({ createdAt: -1 })
      .lean();

    if (filter.search) {
      const search = filter.search.toLowerCase().trim();
      staffMembers = staffMembers.filter((s: any) => {
        const name = s.userId?.name?.toLowerCase() || "";
        const email = s.userId?.email?.toLowerCase() || "";
        const empId = s.employeeId?.toLowerCase() || "";
        const role = s.role?.toLowerCase() || "";
        const dept = s.departmentId?.name?.toLowerCase() || "";
        const desig = s.designationId?.name?.toLowerCase() || "";
        return (
          name.includes(search) ||
          email.includes(search) ||
          empId.includes(search) ||
          role.includes(search) ||
          dept.includes(search) ||
          desig.includes(search)
        );
      });
    }

    return staffMembers;
  }

  async getEmployeeById(id: string) {
    await this.ensureConnection();
    if (!Types.ObjectId.isValid(id)) return null;

    return await Staff.findById(id)
      .populate("userId", "-password")
      .populate("departmentId")
      .populate("designationId")
      .lean();
  }

  async createEmployee(data: any) {
    await this.ensureConnection();

    let userId = data.userId;

    if (!userId && data.name && data.email) {
      const email = data.email.toLowerCase().trim();
      let user = await User.findOne({ email });
      if (!user) {
        const roleName = data.role || "NURSE";
        let userRole = await Role.findOne({ role: roleName });
        if (!userRole) {
          userRole = await Role.create({ role: roleName, access: [] });
        }
        const hashedPassword = await bcrypt.hash(data.password || "Hospital@2026", 10);
        user = await User.create({
          name: data.name.trim(),
          email,
          password: hashedPassword,
          gender: data.gender || "OTHER",
          phone: data.phone,
          role: userRole._id,
          isActive: true
        });
      }
      userId = user._id;
    }

    if (!userId) {
      throw new Error("Valid user account is required to register an employee");
    }

    const existingStaff = await Staff.findOne({ userId });
    if (existingStaff) {
      throw new Error("An employee profile already exists for this user");
    }

    const employeeId =
      data.employeeId?.trim().toUpperCase() ||
      `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newStaff = await Staff.create({
      userId,
      employeeId,
      departmentId: data.departmentId && Types.ObjectId.isValid(data.departmentId) ? data.departmentId : undefined,
      designationId: data.designationId && Types.ObjectId.isValid(data.designationId) ? data.designationId : undefined,
      role: data.role || "NURSE",
      qualification: data.qualification?.trim() || "",
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      shift: data.shift || "MORNING",
      phone: data.phone?.trim() || "",
      emergencyContact: data.emergencyContact?.trim() || "",
      status: data.status || "ACTIVE",
      salary: Number(data.salary) || 35000,
      bankName: data.bankName?.trim() || "",
      accountNumber: data.accountNumber?.trim() || "",
      ifscCode: data.ifscCode?.trim() || "",
      panNumber: data.panNumber?.trim() || "",
      aadhaarNumber: data.aadhaarNumber?.trim() || "",
      address: data.address?.trim() || ""
    });

    return await Staff.findById(newStaff._id)
      .populate("userId", "-password")
      .populate("departmentId")
      .populate("designationId")
      .lean();
  }

  async updateEmployee(id: string, data: any) {
    await this.ensureConnection();
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid employee ID");

    const updated = await Staff.findByIdAndUpdate(
      id,
      {
        departmentId: data.departmentId && Types.ObjectId.isValid(data.departmentId) ? data.departmentId : undefined,
        designationId: data.designationId && Types.ObjectId.isValid(data.designationId) ? data.designationId : undefined,
        role: data.role,
        qualification: data.qualification,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
        shift: data.shift,
        phone: data.phone,
        emergencyContact: data.emergencyContact,
        status: data.status,
        salary: data.salary !== undefined ? Number(data.salary) : undefined,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        panNumber: data.panNumber,
        aadhaarNumber: data.aadhaarNumber,
        address: data.address
      },
      { new: true }
    )
      .populate("userId", "-password")
      .populate("departmentId")
      .populate("designationId")
      .lean();

    // If user name or email updated, sync user table
    if (updated?.userId?._id && (data.name || data.email || data.phone || data.gender)) {
      await User.findByIdAndUpdate(updated.userId._id, {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase().trim() }),
        ...(data.phone && { phone: data.phone }),
        ...(data.gender && { gender: data.gender })
      });
    }

    return updated;
  }

  async deleteEmployee(id: string) {
    await this.ensureConnection();
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid employee ID");
    return await Staff.findByIdAndDelete(id).lean();
  }

  // 3. Staff Profiles & Complete Dossiers
  async getStaffProfiles(search?: string, departmentId?: string) {
    await this.ensureConnection();

    const employees = await this.getEmployees({ departmentId, search });

    // Fetch related records (attendance count, documents count, leaves count)
    const userIds = employees.map((e: any) => e.userId?._id).filter(Boolean);

    const [documents, leaves, attendances] = await Promise.all([
      StaffDocument.find({ userId: { $in: userIds } }).lean(),
      Leave.find({ userId: { $in: userIds } }).lean(),
      Attendance.find({ userId: { $in: userIds } }).lean()
    ]);

    const docMap = new Map<string, any[]>();
    documents.forEach((d: any) => {
      const uId = d.userId.toString();
      if (!docMap.has(uId)) docMap.set(uId, []);
      docMap.get(uId)!.push(d);
    });

    const leaveMap = new Map<string, any[]>();
    leaves.forEach((l: any) => {
      const uId = l.userId.toString();
      if (!leaveMap.has(uId)) leaveMap.set(uId, []);
      leaveMap.get(uId)!.push(l);
    });

    const attendanceMap = new Map<string, any[]>();
    attendances.forEach((a: any) => {
      const uId = a.userId.toString();
      if (!attendanceMap.has(uId)) attendanceMap.set(uId, []);
      attendanceMap.get(uId)!.push(a);
    });

    return employees.map((emp: any) => {
      const uId = emp.userId?._id?.toString() || "";
      const empDocs = docMap.get(uId) || [];
      const empLeaves = leaveMap.get(uId) || [];
      const empAtt = attendanceMap.get(uId) || [];

      return {
        ...emp,
        dossier: {
          documentsCount: empDocs.length,
          verifiedDocumentsCount: empDocs.filter((d: any) => d.verificationStatus === "VERIFIED").length,
          totalLeavesTaken: empLeaves.filter((l: any) => l.status === "APPROVED").reduce((sum: number, l: any) => sum + (l.daysCount || 1), 0),
          pendingLeaves: empLeaves.filter((l: any) => l.status === "PENDING").length,
          totalPunchesLogged: empAtt.length,
          documents: empDocs
        }
      };
    });
  }

  // 4. HR Departments (Workforce Distribution & Budgeting)
  async getHRDepartments() {
    await this.ensureConnection();

    const [departments, staffMembers, doctors] = await Promise.all([
      Department.find({ isActive: true }).lean(),
      Staff.find().populate("userId", "name email").lean(),
      Doctor.find({ status: "ACTIVE" }).populate("userId", "name email").lean()
    ]);

    return departments.map((dept: any) => {
      const dId = dept._id.toString();
      const deptStaff = staffMembers.filter((s: any) => s.departmentId?.toString() === dId);
      const deptDoctors = doctors.filter((d: any) => d.departmentId?.toString() === dId);

      const staffPayroll = deptStaff.reduce((acc: number, s: any) => acc + (Number(s.salary) || 35000), 0);
      const doctorPayroll = deptDoctors.length * 120000;
      const monthlyBudget = staffPayroll + doctorPayroll;

      return {
        _id: dId,
        name: dept.name,
        code: dept.code,
        location: dept.location || "Hospital Main Building",
        phoneExtension: dept.phoneExtension || "100",
        headCount: deptStaff.length + deptDoctors.length,
        staffCount: deptStaff.length,
        doctorCount: deptDoctors.length,
        ratio: deptDoctors.length > 0 ? `${(deptStaff.length / deptDoctors.length).toFixed(1)} : 1` : `${deptStaff.length} : 0`,
        monthlyPayroll: monthlyBudget,
        staff: deptStaff.slice(0, 5)
      };
    }).sort((a: any, b: any) => b.headCount - a.headCount);
  }

  // 5. HR Designations & Pay Scales
  async getHRDesignations() {
    await this.ensureConnection();

    const [designations, staffList] = await Promise.all([
      Designation.find({ isActive: true }).lean(),
      Staff.find().lean()
    ]);

    return designations.map((desig: any) => {
      const dId = desig._id.toString();
      const count = staffList.filter((s: any) => s.designationId?.toString() === dId).length;

      return {
        _id: dId,
        name: desig.name,
        code: desig.code,
        department: desig.department || "General",
        level: desig.level || "Mid-Level",
        description: desig.description,
        salaryMin: Number(desig.salaryMin) || 25000,
        salaryMax: Number(desig.salaryMax) || 60000,
        requirements: desig.requirements || "Standard Healthcare Credentials",
        employeeCount: count
      };
    }).sort((a: any, b: any) => b.employeeCount - a.employeeCount);
  }

  async updateDesignationPayBand(id: string, data: { salaryMin?: number; salaryMax?: number; requirements?: string; level?: string }) {
    await this.ensureConnection();
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid designation ID");

    return await Designation.findByIdAndUpdate(
      id,
      {
        ...(data.salaryMin !== undefined && { salaryMin: Number(data.salaryMin) }),
        ...(data.salaryMax !== undefined && { salaryMax: Number(data.salaryMax) }),
        ...(data.requirements && { requirements: data.requirements }),
        ...(data.level && { level: data.level })
      },
      { new: true }
    ).lean();
  }

  // 6. Shifts & Duty Allocation
  async getShifts(filter: { shiftType?: string; status?: string; wardId?: string } = {}) {
    await this.ensureConnection();

    const query: any = {};
    if (filter.shiftType && filter.shiftType !== "ALL") {
      query.shiftType = filter.shiftType;
    }
    if (filter.status && filter.status !== "ALL") {
      query.status = filter.status;
    }
    if (filter.wardId && Types.ObjectId.isValid(filter.wardId)) {
      query.ward = filter.wardId;
    }

    return await Shift.find(query)
      .populate("user", "name email role")
      .populate("ward", "wardName wardType floor")
      .sort({ startTime: -1 })
      .lean();
  }

  async createShift(data: any) {
    await this.ensureConnection();

    const newShift = await Shift.create({
      user: data.userId,
      ward: data.wardId && Types.ObjectId.isValid(data.wardId) ? data.wardId : undefined,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      shiftType: data.shiftType || "MORNING",
      status: data.status || "SCHEDULED",
      notes: data.notes
    });

    return await Shift.findById(newShift._id)
      .populate("user", "name email role")
      .populate("ward", "wardName wardType floor")
      .lean();
  }

  async updateShift(id: string, data: any) {
    await this.ensureConnection();
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid shift ID");

    return await Shift.findByIdAndUpdate(
      id,
      {
        ...(data.userId && { user: data.userId }),
        ...(data.wardId && { ward: data.wardId }),
        ...(data.startTime && { startTime: new Date(data.startTime) }),
        ...(data.endTime && { endTime: new Date(data.endTime) }),
        ...(data.shiftType && { shiftType: data.shiftType }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes })
      },
      { new: true }
    )
      .populate("user", "name email role")
      .populate("ward", "wardName wardType floor")
      .lean();
  }

  async deleteShift(id: string) {
    await this.ensureConnection();
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid shift ID");
    return await Shift.findByIdAndDelete(id).lean();
  }

  // 7. Biometric Attendance
  async getAttendance(dateStr?: string, status?: string) {
    await this.ensureConnection();

    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      date: { $gte: startOfDay, $lte: endOfDay }
    };
    if (status && status !== "ALL") {
      query.status = status;
    }

    return await Attendance.find(query)
      .populate("userId", "name email role")
      .sort({ clockIn: -1 })
      .lean();
  }

  async recordAttendance(data: any) {
    await this.ensureConnection();

    const recordDate = data.date ? new Date(data.date) : new Date();
    const clockIn = data.clockIn ? new Date(data.clockIn) : new Date();
    const clockOut = data.clockOut ? new Date(data.clockOut) : undefined;

    let workingHours = Number(data.workingHours) || 8;
    if (clockOut && clockIn) {
      const diffMs = clockOut.getTime() - clockIn.getTime();
      workingHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
    }

    const record = await Attendance.create({
      userId: data.userId,
      date: recordDate,
      clockIn,
      clockOut,
      shiftType: data.shiftType || "MORNING",
      status: data.status || "PRESENT",
      workingHours,
      location: data.location || "Main Hospital Biometric Terminal",
      notes: data.notes,
      verifiedBy: data.verifiedBy || "HR Manual Override"
    });

    return await Attendance.findById(record._id)
      .populate("userId", "name email role")
      .lean();
  }

  async getAttendanceStats(dateStr?: string) {
    await this.ensureConnection();

    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [attendanceList, totalStaff, totalDoctors] = await Promise.all([
      Attendance.find({ date: { $gte: startOfDay, $lte: endOfDay } }).lean(),
      Staff.countDocuments({ status: "ACTIVE" }),
      Doctor.countDocuments({ status: "ACTIVE" })
    ]);

    const totalExpected = Math.max(1, totalStaff + totalDoctors);
    const present = attendanceList.filter((a: any) => a.status === "PRESENT").length;
    const late = attendanceList.filter((a: any) => a.status === "LATE").length;
    const halfDay = attendanceList.filter((a: any) => a.status === "HALF_DAY").length;
    const onLeave = attendanceList.filter((a: any) => a.status === "ON_LEAVE").length;
    const absent = Math.max(0, totalExpected - (present + late + halfDay + onLeave));

    return {
      date: startOfDay.toISOString().split("T")[0],
      totalExpected,
      present,
      late,
      halfDay,
      onLeave,
      absent,
      attendanceRate: `${Math.round(((present + late) / totalExpected) * 100)}%`
    };
  }

  // 8. Leave Management & Approvals
  async getLeaves(filter: { status?: string; leaveType?: string; userId?: string } = {}) {
    await this.ensureConnection();

    const query: any = {};
    if (filter.status && filter.status !== "ALL") {
      query.status = filter.status;
    }
    if (filter.leaveType && filter.leaveType !== "ALL") {
      query.leaveType = filter.leaveType;
    }
    if (filter.userId && Types.ObjectId.isValid(filter.userId)) {
      query.userId = filter.userId;
    }

    return await Leave.find(query)
      .populate("userId", "name email role")
      .populate("approvedBy", "name email")
      .sort({ appliedAt: -1 })
      .lean();
  }

  async applyLeave(data: any) {
    await this.ensureConnection();

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const leave = await Leave.create({
      userId: data.userId,
      leaveType: data.leaveType || "CASUAL",
      startDate: start,
      endDate: end,
      daysCount: data.daysCount || diffDays,
      reason: data.reason?.trim() || "Personal Leave",
      status: "PENDING",
      appliedAt: new Date()
    });

    return await Leave.findById(leave._id)
      .populate("userId", "name email role")
      .lean();
  }

  async updateLeaveStatus(id: string, status: "APPROVED" | "REJECTED" | "CANCELLED", approverId?: string, rejectionReason?: string) {
    await this.ensureConnection();
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid leave ID");

    const updated = await Leave.findByIdAndUpdate(
      id,
      {
        status,
        ...(approverId && Types.ObjectId.isValid(approverId) && { approvedBy: approverId }),
        actionDate: new Date(),
        ...(rejectionReason && { rejectionReason })
      },
      { new: true }
    )
      .populate("userId", "name email role")
      .populate("approvedBy", "name email")
      .lean();

    return updated;
  }

  // 9. Staff Documents & Compliance
  async getStaffDocuments(filter: { verificationStatus?: string; documentType?: string; userId?: string } = {}) {
    await this.ensureConnection();

    const query: any = {};
    if (filter.verificationStatus && filter.verificationStatus !== "ALL") {
      query.verificationStatus = filter.verificationStatus;
    }
    if (filter.documentType && filter.documentType !== "ALL") {
      query.documentType = filter.documentType;
    }
    if (filter.userId && Types.ObjectId.isValid(filter.userId)) {
      query.userId = filter.userId;
    }

    return await StaffDocument.find(query)
      .populate("userId", "name email role")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();
  }

  async uploadStaffDocument(data: any) {
    await this.ensureConnection();

    const doc = await StaffDocument.create({
      userId: data.userId,
      documentType: data.documentType || "ID_PROOF",
      title: data.title?.trim(),
      documentNumber: data.documentNumber?.trim(),
      fileUrl: data.fileUrl || "/documents/sample-staff-document.pdf",
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      verificationStatus: data.verificationStatus || "PENDING",
      notes: data.notes
    });

    return await StaffDocument.findById(doc._id)
      .populate("userId", "name email role")
      .lean();
  }

  async verifyDocument(id: string, status: "VERIFIED" | "REJECTED", verifierId?: string, notes?: string) {
    await this.ensureConnection();
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid document ID");

    return await StaffDocument.findByIdAndUpdate(
      id,
      {
        verificationStatus: status,
        verifiedAt: new Date(),
        ...(verifierId && Types.ObjectId.isValid(verifierId) && { verifiedBy: verifierId }),
        ...(notes && { notes })
      },
      { new: true }
    )
      .populate("userId", "name email role")
      .populate("verifiedBy", "name email")
      .lean();
  }

  async deleteStaffDocument(id: string) {
    await this.ensureConnection();
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid document ID");
    return await StaffDocument.findByIdAndDelete(id).lean();
  }

  // 10. HR Workforce Reports & Analytics
  async getHRReports(timeframe?: string) {
    await this.ensureConnection();

    const [staffList, doctors, leaves, attendance, departments, documents] = await Promise.all([
      Staff.find().populate("departmentId", "name").populate("designationId", "name").lean(),
      Doctor.find({ status: "ACTIVE" }).populate("departmentId", "name").lean(),
      Leave.find().lean(),
      Attendance.find().lean(),
      Department.find({ isActive: true }).lean(),
      StaffDocument.find().lean()
    ]);

    // Role breakdown
    const roleStats: Record<string, number> = {};
    staffList.forEach((s: any) => {
      const r = s.role || "NURSE";
      roleStats[r] = (roleStats[r] || 0) + 1;
    });
    roleStats["DOCTOR"] = doctors.length;

    // Shift distribution
    const shiftStats: Record<string, number> = {
      MORNING: 0,
      EVENING: 0,
      NIGHT: 0,
      ROTATING: 0
    };
    staffList.forEach((s: any) => {
      const sh = s.shift || "MORNING";
      shiftStats[sh] = (shiftStats[sh] || 0) + 1;
    });

    // Leave type distribution
    const leaveStats: Record<string, number> = {
      CASUAL: 0,
      SICK: 0,
      EARNED: 0,
      MATERNITY: 0,
      PATERNITY: 0,
      UNPAID: 0
    };
    leaves.forEach((l: any) => {
      const t = l.leaveType || "CASUAL";
      leaveStats[t] = (leaveStats[t] || 0) + 1;
    });

    // Document compliance
    const docStatusMap = {
      VERIFIED: documents.filter((d: any) => d.verificationStatus === "VERIFIED").length,
      PENDING: documents.filter((d: any) => d.verificationStatus === "PENDING").length,
      REJECTED: documents.filter((d: any) => d.verificationStatus === "REJECTED").length
    };

    // Department payroll breakdown in ₹
    const departmentPayroll = departments.map((dept: any) => {
      const dId = dept._id.toString();
      const dStaff = staffList.filter((s: any) => s.departmentId?._id?.toString() === dId || s.departmentId?.toString() === dId);
      const dDocs = doctors.filter((d: any) => d.departmentId?._id?.toString() === dId || d.departmentId?.toString() === dId);

      const staffSpend = dStaff.reduce((sum: number, s: any) => sum + (Number(s.salary) || 35000), 0);
      const docSpend = dDocs.length * 120000;

      return {
        department: dept.name,
        headCount: dStaff.length + dDocs.length,
        payrollSpend: staffSpend + docSpend
      };
    }).sort((a, b) => b.payrollSpend - a.payrollSpend);

    const totalWorkforce = staffList.length + doctors.length;
    const totalMonthlyPayroll = departmentPayroll.reduce((sum, d) => sum + d.payrollSpend, 0);

    return {
      totalWorkforce,
      totalMonthlyPayroll,
      roleDistribution: roleStats,
      shiftDistribution: shiftStats,
      leaveTypeDistribution: leaveStats,
      documentCompliance: docStatusMap,
      departmentPayrollDistribution: departmentPayroll
    };
  }
}

export const hrService = new HRService();
export default hrService;
