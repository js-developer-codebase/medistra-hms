import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/organization.model";
import Department from "@/models/department.model";
import OrganizationSetting, { IOrganizationSetting } from "@/models/organization-setting.model";
import HospitalSetting, { IHospitalSetting } from "@/models/hospital-setting.model";
import BranchSetting, { IBranchSetting } from "@/models/branch-setting.model";
import User from "@/models/user.model";
import Bed from "@/models/bed.model";
import mongoose from "mongoose";

const _ensureModels = () => {
  if (!mongoose.models.Organization && Organization) {}
  if (!mongoose.models.Department && Department) {}
  if (!mongoose.models.OrganizationSetting && OrganizationSetting) {}
  if (!mongoose.models.HospitalSetting && HospitalSetting) {}
  if (!mongoose.models.BranchSetting && BranchSetting) {}
  if (!mongoose.models.User && User) {}
  if (!mongoose.models.Bed && Bed) {}
};

export class OrganizationMgmtService {
  /**
   * High-Level Executive Network Telemetry
   */
  static async getNetworkTelemetry() {
    await dbConnect();
    _ensureModels();

    const [
      totalFacilities,
      hospitalsCount,
      branchesCount,
      departmentsCount,
      totalStaffCount,
      activeBedsCount,
      hospSetting,
      facilities,
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ $or: [{ branchType: "MAIN" }, { organizationType: "HOSPITAL" }] }),
      Organization.countDocuments({ branchType: "BRANCH" }),
      Department.countDocuments(),
      User.countDocuments({ isActive: true }),
      Bed.countDocuments(),
      this.getHospitalSettings(),
      Organization.find().sort({ createdAt: -1 }).lean(),
    ]);

    const totalNetworkBeds = activeBedsCount > 0 ? activeBedsCount : hospSetting.totalBeds || 450;

    return {
      totalFacilities,
      hospitalsCount,
      branchesCount,
      departmentsCount,
      totalStaffCount,
      totalNetworkBeds,
      icuCapacity: hospSetting.icuBeds || 60,
      facilities,
    };
  }

  /**
   * Hospitals Management
   */
  static async getHospitals() {
    await dbConnect();
    _ensureModels();

    return await Organization.find({
      $or: [{ branchType: "MAIN" }, { organizationType: "HOSPITAL" }],
    })
      .sort({ createdAt: 1 })
      .lean();
  }

  static async createHospital(data: any) {
    await dbConnect();
    _ensureModels();

    const org = await Organization.create({
      ...data,
      organizationType: "HOSPITAL",
      branchType: data.branchType || "MAIN",
    });

    // Create corresponding hospital setting if provided
    if (data.settings) {
      await HospitalSetting.create({
        ...data.settings,
        hospitalId: org._id,
      });
    }

    return org;
  }

  static async updateHospital(id: string, data: any) {
    await dbConnect();
    _ensureModels();

    const updated = await Organization.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new Error("Hospital not found");
    return updated;
  }

  static async deleteHospital(id: string) {
    await dbConnect();
    _ensureModels();

    const deleted = await Organization.findByIdAndDelete(id);
    if (!deleted) throw new Error("Hospital not found");
    return deleted;
  }

  /**
   * Satellite Branches & Clinics Management
   */
  static async getBranches() {
    await dbConnect();
    _ensureModels();

    return await Organization.find({ branchType: "BRANCH" })
      .populate("headQuarter", "organizationName")
      .sort({ createdAt: 1 })
      .lean();
  }

  static async createBranch(data: any) {
    await dbConnect();
    _ensureModels();

    const branch = await Organization.create({
      ...data,
      branchType: "BRANCH",
      organizationType: data.organizationType || "CLINIC",
    });

    if (data.settings) {
      await BranchSetting.create({
        ...data.settings,
        branchId: branch._id,
      });
    }

    return branch;
  }

  static async updateBranch(id: string, data: any) {
    await dbConnect();
    _ensureModels();

    const updated = await Organization.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new Error("Branch not found");
    return updated;
  }

  static async deleteBranch(id: string) {
    await dbConnect();
    _ensureModels();

    const deleted = await Organization.findByIdAndDelete(id);
    if (!deleted) throw new Error("Branch not found");
    return deleted;
  }

  /**
   * Departments Management
   */
  static async getDepartments() {
    await dbConnect();
    _ensureModels();

    return await Department.find()
      .populate("organizationId", "organizationName")
      .sort({ name: 1 })
      .lean();
  }

  static async createDepartment(data: any) {
    await dbConnect();
    _ensureModels();

    return await Department.create(data);
  }

  static async updateDepartment(id: string, data: any) {
    await dbConnect();
    _ensureModels();

    const updated = await Department.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new Error("Department not found");
    return updated;
  }

  static async deleteDepartment(id: string) {
    await dbConnect();
    _ensureModels();

    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) throw new Error("Department not found");
    return deleted;
  }

  /**
   * Corporate Settings (PAN, GSTIN, CIN, ₹ Currency)
   */
  static async getOrgSettings() {
    await dbConnect();
    _ensureModels();

    let settings = await OrganizationSetting.findOne().lean();
    if (!settings) {
      settings = await OrganizationSetting.create({
        cinNumber: "U85110WB2018PTC224890",
        panNumber: "AAACM8912P",
        gstin: "19AAACM8912P1ZV",
        currency: "INR",
        currencySymbol: "₹",
        fiscalYearStart: "April",
        fiscalYearEnd: "March",
        tagline: "Centre of Excellence in Tertiary & Quaternary Healthcare",
        website: "https://medistra.hospital",
        emergencyHotline: "+91 33 2345 6780",
        letterheadHeader: "MEDISTRA HEALTHCARE SYSTEM - TRUSTED CLINICAL EXCELLENCE",
        letterheadFooter: "12 Medical Enclave, Central Avenue, Kolkata | 24x7 Helpline: 1800-200-8899",
      });
    }

    return settings as IOrganizationSetting;
  }

  static async updateOrgSettings(data: Partial<IOrganizationSetting>) {
    await dbConnect();
    _ensureModels();

    let settings = await OrganizationSetting.findOne();
    if (!settings) {
      settings = await OrganizationSetting.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }

    return settings;
  }

  /**
   * Hospital Unit Operations & NABH Accreditation Settings
   */
  static async getHospitalSettings(hospitalId?: string) {
    await dbConnect();
    _ensureModels();

    const query = hospitalId ? { hospitalId } : {};
    let settings = await HospitalSetting.findOne(query).lean();

    if (!settings) {
      settings = await HospitalSetting.create({
        nabhAccredited: true,
        nabhCode: "NABH-2024-HOSP-0982",
        jciAccredited: true,
        totalBeds: 450,
        icuBeds: 60,
        nicuBeds: 24,
        otSuites: 12,
        bloodBankLicense: "DL-BB-WB-2022-04",
        pharmacyLicense: "WB/KOL/20/21B/4921",
        ambulanceHotline: "+91 33 2345 6789",
        casualtyPhone: "+91 33 2345 6701",
        visitingHours: "04:30 PM - 07:00 PM",
        dischargeCheckTime: "11:00 AM",
      });
    }

    return settings as IHospitalSetting;
  }

  static async updateHospitalSettings(data: Partial<IHospitalSetting>) {
    await dbConnect();
    _ensureModels();

    let settings = await HospitalSetting.findOne();
    if (!settings) {
      settings = await HospitalSetting.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }

    return settings;
  }

  /**
   * Satellite Branch Timings, Daycare & Sample Courier Settings
   */
  static async getBranchSettings(branchId?: string) {
    await dbConnect();
    _ensureModels();

    const query = branchId ? { branchId } : {};
    let settings = await BranchSetting.findOne(query).lean();

    if (!settings) {
      settings = await BranchSetting.create({
        branchCode: "BR-SL-01",
        operatingHours: "07:00 AM - 09:00 PM (All 7 Days)",
        consultationRooms: 8,
        dayCareBeds: 10,
        hasPharmacy: true,
        hasSampleCollection: true,
        sampleCourierSchedule: "Twice Daily (11:30 AM & 04:30 PM)",
        teleconsultationEnabled: true,
        branchManager: "Mr. Debabrata Sen",
        branchManagerPhone: "+91 98310 99881",
      });
    }

    return settings as IBranchSetting;
  }

  static async updateBranchSettings(data: Partial<IBranchSetting>) {
    await dbConnect();
    _ensureModels();

    let settings = await BranchSetting.findOne();
    if (!settings) {
      settings = await BranchSetting.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }

    return settings;
  }
}
