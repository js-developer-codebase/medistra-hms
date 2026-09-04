import { Types } from "mongoose";
import Patient from "@/models/patient.model";
import Appointment from "@/models/appointment.model";
import User from "@/models/user.model";
import Doctor from "@/models/doctor.model";
import Admission from "@/models/admission.model";
import Bed from "@/models/bed.model";
import Ward from "@/models/ward.model";
import Room from "@/models/room.model";
import { ClinicalRecord } from "@/models/clinical-record.model";
import { Diagnosis } from "@/models/diagnosis.model";
import LabOrder from "@/models/lab-order.model";
import RadiologyOrder from "@/models/radiology-order.model";
import Medicine from "@/models/medicine.model";
import PharmacyDispense from "@/models/pharmacy-dispense.model";
import InventoryItem from "@/models/inventory-item.model";
import PurchaseOrder from "@/models/purchase-order.model";
import Invoice from "@/models/invoice.model";
import InsuranceClaim from "@/models/insurance-claim.model";
import InsuranceProvider from "@/models/insurance-provider.model";
import Department from "@/models/department.model";
import LabTest from "@/models/lab-test.model";
import RadiologyProcedure from "@/models/radiology-procedure.model";

export class ReportsService {
  // Helper to get date boundaries based on timeframe
  private getDateFilter(timeframe?: string) {
    if (!timeframe || timeframe === "ALL_TIME") return {};
    const now = new Date();
    const startDate = new Date();

    if (timeframe === "TODAY") {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === "7_DAYS") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === "30_DAYS") {
      startDate.setDate(now.getDate() - 30);
    } else if (timeframe === "90_DAYS" || timeframe === "QUARTER") {
      startDate.setDate(now.getDate() - 90);
    } else if (timeframe === "YTD") {
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
    }

    return { $gte: startDate, $lte: now };
  }

  // 1. Operations Hub Summary
  async getSummaryStats(timeframe?: string) {
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const [
      totalPatients,
      totalAppointments,
      totalAdmissions,
      activeAdmissions,
      totalBeds,
      occupiedBedsCount,
      paidInvoices,
      allInvoices,
      insuranceClaims,
      lowStockItemsCount
    ] = await Promise.all([
      Patient.countDocuments({ isMerged: { $ne: true } }),
      Appointment.countDocuments(dateQuery),
      Admission.countDocuments(dateQuery),
      Admission.countDocuments({ status: { $in: ["ADMITTED", "ACTIVE"] } }),
      Bed.countDocuments(),
      Bed.countDocuments({ status: { $regex: /^occupied$/i } }),
      Invoice.find({ status: "PAID", ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) }).lean(),
      Invoice.find(dateQuery).lean(),
      InsuranceClaim.find().lean(),
      InventoryItem.countDocuments({ $expr: { $lte: ["$currentStock", "$reorderLevel"] } })
    ]);

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (Number(inv.finalAmount) || 0), 0);
    const totalBilled = allInvoices.reduce((sum, inv) => sum + (Number(inv.finalAmount) || 0), 0);
    const totalOutstanding = Math.max(0, totalBilled - totalRevenue);

    const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBedsCount / totalBeds) * 100) : 0;

    const totalClaimsAmount = insuranceClaims.reduce((sum, c) => sum + (Number(c.amountClaimed) || 0), 0);
    const totalClaimsSettled = insuranceClaims.reduce((sum, c) => sum + (Number(c.amountSettled) || 0), 0);
    const pendingInsuranceReceivables = Math.max(0, totalClaimsAmount - totalClaimsSettled);

    return {
      overview: {
        totalPatients,
        totalAppointments,
        totalAdmissions,
        activeInpatients: activeAdmissions,
        totalBeds,
        occupiedBeds: occupiedBedsCount,
        availableBeds: Math.max(0, totalBeds - occupiedBedsCount),
        bedOccupancyRate: `${bedOccupancyRate}%`,
        totalRevenue,
        totalBilled,
        totalOutstanding,
        pendingInsuranceReceivables,
        lowStockAlerts: lowStockItemsCount
      },
      timeframe: timeframe || "ALL_TIME"
    };
  }

  // 2. Executive Management Dashboard
  async getManagementReport(timeframe?: string) {
    const summary = await this.getSummaryStats(timeframe);
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const [departments, doctorsCount, recentInvoices, activeAppointments] = await Promise.all([
      Department.find({ status: "ACTIVE" }).select("name code").lean(),
      Doctor.countDocuments({ status: "ACTIVE" }),
      Invoice.find(dateQuery).sort({ createdAt: -1 }).limit(10).lean(),
      Appointment.find({ status: { $in: ["CONFIRMED", "SCHEDULED"] } }).countDocuments()
    ]);

    return {
      ...summary,
      executive: {
        activeDoctors: doctorsCount,
        activeDepartments: departments.length,
        scheduledAppointments: activeAppointments,
        recentFinancialTransactions: recentInvoices
      }
    };
  }

  // 3. Patient Reports & Demographics
  async getPatientReport(timeframe?: string) {
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const [totalPatients, filteredPatients, genderAgg, bloodAgg, allPatients] = await Promise.all([
      Patient.countDocuments({ isMerged: { $ne: true } }),
      Patient.countDocuments({ ...dateQuery, isMerged: { $ne: true } }),
      Patient.aggregate([
        { $match: { isMerged: { $ne: true } } },
        { $group: { _id: "$gender", count: { $sum: 1 } } }
      ]),
      Patient.aggregate([
        { $match: { isMerged: { $ne: true } } },
        { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
      ]),
      Patient.find({ isMerged: { $ne: true } }).select("age createdAt").lean()
    ]);

    const genderStats: Record<string, number> = {};
    genderAgg.forEach((g) => {
      genderStats[g._id || "Other"] = g.count;
    });

    const bloodGroupStats: Record<string, number> = {};
    bloodAgg.forEach((b) => {
      if (b._id) bloodGroupStats[b._id] = b.count;
    });

    // Age brackets
    let pediatric = 0; // 0 - 17
    let adult = 0; // 18 - 59
    let geriatric = 0; // 60+

    allPatients.forEach((p) => {
      const age = Number(p.age || 0);
      if (age < 18) pediatric++;
      else if (age < 60) adult++;
      else geriatric++;
    });

    return {
      totalPatients,
      newRegistrations: filteredPatients,
      demographics: {
        genderStats,
        bloodGroupStats,
        ageBrackets: {
          pediatric,
          adult,
          geriatric
        }
      }
    };
  }

  // 4. Appointment Reports
  async getAppointmentReport(timeframe?: string) {
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { appointmentDate: dateFilter } : {};

    const [total, statusAgg, rawAppointments] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.aggregate([
        { $match: dateQuery },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Appointment.find(dateQuery)
        .populate("patientId", "name uhid age gender")
        .populate({
          path: "doctorId",
          select: "specialization departmentId userId consultationFee",
          populate: [
            { path: "userId", select: "name email phone" },
            { path: "departmentId", select: "name code" }
          ]
        })
        .sort({ appointmentDate: -1 })
        .limit(20)
        .lean()
    ]);

    const appointments = rawAppointments.map((appt: any) => {
      const doc = appt.doctorId;
      const doctorName = doc?.userId?.name || doc?.name || "Consulting Physician";
      const department = doc?.departmentId || null;
      return {
        ...appt,
        doctorId: {
          ...doc,
          name: doctorName
        },
        departmentId: department
      };
    });

    const statusCounts: Record<string, number> = {
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      PENDING: 0,
      NO_SHOW: 0
    };

    statusAgg.forEach((s) => {
      if (s._id) statusCounts[s._id] = s.count;
    });

    const completed = statusCounts.COMPLETED || 0;
    const cancelled = (statusCounts.CANCELLED || 0) + (statusCounts.NO_SHOW || 0);
    const completionRate = total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%";

    return {
      totalAppointments: total,
      statusCounts,
      completionRate,
      cancellationCount: cancelled,
      recentAppointments: appointments
    };
  }

  // 5. Doctor Reports
  async getDoctorReport(timeframe?: string) {
    const [doctors, appointments] = await Promise.all([
      Doctor.find()
        .populate("userId", "name email phone role isActive")
        .populate("departmentId", "name code")
        .lean(),
      Appointment.find().populate("doctorId").lean()
    ]);

    const doctorLoadMap: Record<string, number> = {};
    appointments.forEach((a: any) => {
      const docId = a.doctorId?._id?.toString() || a.doctorId?.toString();
      if (docId) {
        doctorLoadMap[docId] = (doctorLoadMap[docId] || 0) + 1;
      }
    });

    const doctorStats = doctors.map((d: any) => {
      const docId = d._id.toString();
      const consultationsCount = doctorLoadMap[docId] || 0;
      const fee = Number(d.consultationFee || 500);
      return {
        id: docId,
        name: d.userId?.name || `Dr. ${d.specialization || "Physician"}`,
        specialization: d.specialization || "General Medicine",
        department: d.departmentId?.name || "OPD",
        status: d.status || "ACTIVE",
        licenseNo: d.licenseNo,
        consultationFee: fee,
        consultationsCount,
        estimatedRevenue: consultationsCount * fee
      };
    }).sort((a, b) => b.consultationsCount - a.consultationsCount);

    return {
      totalDoctors: doctors.length,
      activeDoctors: doctors.filter((d: any) => d.status === "ACTIVE").length,
      doctorPerformance: doctorStats
    };
  }

  // 6. Admission Reports
  async getAdmissionReport(timeframe?: string) {
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { admissionDate: dateFilter } : {};

    const [rawAdmissions, activeCount] = await Promise.all([
      Admission.find(dateQuery)
        .populate("patientId", "name uhid age gender contact")
        .populate({
          path: "bedId",
          select: "bedNumber status roomId",
          populate: {
            path: "roomId",
            select: "roomNumber wardId",
            populate: { path: "wardId", select: "wardName wardType" }
          }
        })
        .populate("doctorId", "name email")
        .sort({ admissionDate: -1 })
        .lean(),
      Admission.countDocuments({ status: { $in: ["ADMITTED", "ACTIVE"] } })
    ]);

    let emergency = 0;
    let elective = 0;

    const admissions = rawAdmissions.map((a: any) => {
      if (a.admissionType === "EMERGENCY") emergency++;
      else elective++;

      const ward = a.bedId?.roomId?.wardId;
      return {
        ...a,
        departmentId: {
          name: ward?.wardName || "Inpatient (IPD)"
        }
      };
    });

    return {
      totalAdmissions: admissions.length,
      activeInpatients: activeCount,
      admissionTypes: {
        emergency,
        elective
      },
      admissionsList: admissions
    };
  }

  // 7. Discharge Reports
  async getDischargeReport(timeframe?: string) {
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { dischargeDate: dateFilter } : {};

    const rawDischarges = await Admission.find({
      status: { $in: ["DISCHARGED", "CLOSED"] },
      ...dateQuery
    })
      .populate("patientId", "name uhid age gender")
      .populate("doctorId", "name email")
      .sort({ dischargeDate: -1 })
      .lean();

    let totalStayDays = 0;
    const dischargeConditions: Record<string, number> = {
      RECOVERED: 0,
      STABLE: 0,
      TRANSFERRED: 0,
      LAMA: 0,
      DECEASED: 0
    };

    const discharges = rawDischarges.map((d: any) => {
      const cond = d.dischargeCondition || "RECOVERED";
      dischargeConditions[cond] = (dischargeConditions[cond] || 0) + 1;

      if (d.admissionDate && d.dischargeDate) {
        const start = new Date(d.admissionDate).getTime();
        const end = new Date(d.dischargeDate).getTime();
        const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        totalStayDays += days;
      } else {
        totalStayDays += 3;
      }

      return {
        ...d,
        departmentId: {
          name: "Inpatient (IPD)"
        }
      };
    });

    const averageLengthOfStay = discharges.length > 0 ? (totalStayDays / discharges.length).toFixed(1) : "0";

    return {
      totalDischarges: discharges.length,
      averageLengthOfStay: `${averageLengthOfStay} days`,
      dischargeConditions,
      dischargesList: discharges
    };
  }

  // 8. Bed Occupancy Reports
  async getBedOccupancyReport() {
    const [beds, wards, rooms] = await Promise.all([
      Bed.find().populate("roomId").lean(),
      Ward.find().lean(),
      Room.find().populate("wardId").lean()
    ]);

    const totalBeds = beds.length;
    let occupied = 0;
    let available = 0;
    let maintenance = 0;

    beds.forEach((b: any) => {
      const st = (b.status || "").toUpperCase();
      if (st === "OCCUPIED") occupied++;
      else if (st === "MAINTENANCE" || st === "CLEANING" || st === "BLOCKED") maintenance++;
      else available++;
    });

    const occupancyRate = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

    // Ward utilization
    const wardMap: Record<string, { wardName: string; total: number; occupied: number; available: number }> = {};
    wards.forEach((w: any) => {
      wardMap[w._id.toString()] = {
        wardName: w.name || "General Ward",
        total: 0,
        occupied: 0,
        available: 0
      };
    });

    beds.forEach((b: any) => {
      const room = b.roomId as any;
      const wardId = room?.wardId?.toString();
      if (wardId && wardMap[wardId]) {
        wardMap[wardId].total += 1;
        if ((b.status || "").toUpperCase() === "OCCUPIED") wardMap[wardId].occupied += 1;
        else wardMap[wardId].available += 1;
      }
    });

    return {
      totalBeds,
      occupiedBeds: occupied,
      availableBeds: available,
      maintenanceBeds: maintenance,
      occupancyRate: `${occupancyRate}%`,
      wardUtilization: Object.values(wardMap)
    };
  }

  // 9. Clinical Reports
  async getClinicalReport(timeframe?: string) {
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const [diagnoses, records] = await Promise.all([
      Diagnosis.find(dateQuery).populate("patient", "name uhid").lean(),
      ClinicalRecord.find(dateQuery).select("recordType severity status").lean()
    ]);

    const diagnosisFrequency: Record<string, number> = {};
    diagnoses.forEach((d: any) => {
      const desc = d.description || "General Diagnosis";
      diagnosisFrequency[desc] = (diagnosisFrequency[desc] || 0) + 1;
    });

    const topDiagnoses = Object.entries(diagnosisFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const recordTypeStats: Record<string, number> = {};
    records.forEach((r: any) => {
      const t = r.recordType || "Clinical Note";
      recordTypeStats[t] = (recordTypeStats[t] || 0) + 1;
    });

    return {
      totalDiagnosesLogged: diagnoses.length,
      totalClinicalRecords: records.length,
      topDiagnoses,
      recordTypeDistribution: recordTypeStats,
      recentDiagnoses: diagnoses.slice(0, 15)
    };
  }

  // 10. Laboratory Reports
  async getLabReport(timeframe?: string) {
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { orderDate: dateFilter } : {};

    const rawOrders = await LabOrder.find(dateQuery)
      .populate("patient", "name uhid")
      .populate({
        path: "doctor",
        populate: { path: "userId", select: "name" }
      })
      .sort({ orderDate: -1 })
      .lean();

    const orders = rawOrders.map((o: any) => ({
      ...o,
      doctor: {
        ...o.doctor,
        name: o.doctor?.userId?.name || o.doctor?.name || "Consultant"
      }
    }));

    const statusMap: Record<string, number> = {
      Pending: 0,
      "Sample Collected": 0,
      Processing: 0,
      Completed: 0,
      Cancelled: 0
    };

    const priorityMap: Record<string, number> = {
      Routine: 0,
      Urgent: 0,
      STAT: 0
    };

    orders.forEach((o: any) => {
      if (o.status) statusMap[o.status] = (statusMap[o.status] || 0) + 1;
      if (o.priority) priorityMap[o.priority] = (priorityMap[o.priority] || 0) + 1;
    });

    return {
      totalOrders: orders.length,
      statusBreakdown: statusMap,
      priorityBreakdown: priorityMap,
      recentOrders: orders.slice(0, 20)
    };
  }

  // 11. Radiology Reports
  async getRadiologyReport(timeframe?: string) {
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const rawOrders = await RadiologyOrder.find(dateQuery)
      .populate("patient", "name uhid")
      .populate({
        path: "doctor",
        populate: { path: "userId", select: "name" }
      })
      .sort({ createdAt: -1 })
      .lean();

    const orders = rawOrders.map((o: any) => ({
      ...o,
      doctor: {
        ...o.doctor,
        name: o.doctor?.userId?.name || o.doctor?.name || "Consultant"
      }
    }));

    const modalityMap: Record<string, number> = {
      "X-RAY": 0,
      CT: 0,
      MRI: 0,
      ULTRASOUND: 0,
      MAMMOGRAPHY: 0,
      "PET-CT": 0
    };

    const statusMap: Record<string, number> = {
      PENDING: 0,
      SCHEDULED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };

    orders.forEach((o: any) => {
      const m = (o.modality || "").toUpperCase();
      if (modalityMap[m] !== undefined) modalityMap[m] += 1;
      else modalityMap[m] = 1;

      const s = (o.status || "").toUpperCase();
      if (statusMap[s] !== undefined) statusMap[s] += 1;
      else statusMap[s] = 1;
    });

    return {
      totalStudies: orders.length,
      modalityDistribution: modalityMap,
      statusDistribution: statusMap,
      recentStudies: orders.slice(0, 20)
    };
  }

  // 12. Pharmacy Reports
  async getPharmacyReport(timeframe?: string) {
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const [dispenses, totalMedicines] = await Promise.all([
      PharmacyDispense.find(dateQuery).sort({ createdAt: -1 }).lean(),
      Medicine.countDocuments()
    ]);

    let totalRevenue = 0;
    let totalItemsDispensed = 0;
    const paymentModes: Record<string, number> = {};
    const medicineDispensedCount: Record<string, number> = {};

    dispenses.forEach((d: any) => {
      totalRevenue += Number(d.totalAmount || 0);
      const mode = d.paymentMode || "CASH";
      paymentModes[mode] = (paymentModes[mode] || 0) + Number(d.totalAmount || 0);

      (d.items || []).forEach((it: any) => {
        totalItemsDispensed += Number(it.quantity || 1);
        const medName = it.medicineName || "Generic Drug";
        medicineDispensedCount[medName] = (medicineDispensedCount[medName] || 0) + Number(it.quantity || 1);
      });
    });

    const topMedicines = Object.entries(medicineDispensedCount)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return {
      totalDispenseBills: dispenses.length,
      totalCatalogMedicines: totalMedicines,
      totalRevenue,
      totalItemsDispensed,
      paymentModes,
      topMedicines,
      recentDispenses: dispenses.slice(0, 15)
    };
  }

  // 13. Inventory Reports
  async getInventoryReport() {
    const items = await InventoryItem.find().sort({ currentStock: 1 }).lean();

    let totalStockCount = 0;
    let totalValuation = 0;
    let lowStockCount = 0;

    const categoryMap: Record<string, { count: number; valuation: number }> = {};

    items.forEach((item: any) => {
      const stock = Number(item.currentStock || 0);
      const price = Number(item.unitPrice || 0);
      const reorder = Number(item.reorderLevel || 10);

      totalStockCount += stock;
      totalValuation += stock * price;
      if (stock <= reorder) lowStockCount += 1;

      const cat = item.category || "General";
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, valuation: 0 };
      categoryMap[cat].count += stock;
      categoryMap[cat].valuation += stock * price;
    });

    return {
      totalItemTypes: items.length,
      totalStockUnits: totalStockCount,
      totalValuation,
      lowStockCount,
      categoryDistribution: categoryMap,
      criticalItems: items.filter((i: any) => Number(i.currentStock || 0) <= Number(i.reorderLevel || 10)).slice(0, 15)
    };
  }

  // 14. Procurement Reports
  async getProcurementReport(timeframe?: string) {
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { orderDate: dateFilter } : {};

    const orders = await PurchaseOrder.find(dateQuery).sort({ orderDate: -1 }).lean();

    let totalPOValue = 0;
    const statusMap: Record<string, number> = {};
    const supplierSpend: Record<string, number> = {};

    orders.forEach((po: any) => {
      const amt = Number(po.totalAmount || 0);
      totalPOValue += amt;

      const st = po.status || "ORDERED";
      statusMap[st] = (statusMap[st] || 0) + 1;

      const supp = po.supplierName || "Direct Vendor";
      supplierSpend[supp] = (supplierSpend[supp] || 0) + amt;
    });

    const topSuppliers = Object.entries(supplierSpend)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalPurchaseOrders: orders.length,
      totalPOValue,
      statusBreakdown: statusMap,
      topSuppliers,
      recentPurchaseOrders: orders.slice(0, 15)
    };
  }

  // 15. Billing & Revenue Reports
  async getBillingReport(timeframe?: string) {
    const dateFilter = this.getDateFilter(timeframe);
    const dateQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const invoices = await Invoice.find(dateQuery)
      .populate("patientId", "name uhid contact")
      .sort({ createdAt: -1 })
      .lean();

    let grossBilled = 0;
    let netCollected = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    const statusMap: Record<string, number> = {
      PAID: 0,
      PARTIALLY_PAID: 0,
      UNPAID: 0,
      OVERDUE: 0,
      CANCELLED: 0
    };

    const departmentRevenue: Record<string, number> = {};

    invoices.forEach((inv: any) => {
      const finalAmt = Number(inv.finalAmount || 0);
      const paidAmt = Number(inv.paidAmount || (inv.status === "PAID" ? finalAmt : 0));
      const disc = Number(inv.discountAmount || 0);
      const tax = Number(inv.taxAmount || 0);

      grossBilled += finalAmt;
      netCollected += paidAmt;
      discountTotal += disc;
      taxTotal += tax;

      const st = inv.status || "UNPAID";
      if (statusMap[st] !== undefined) statusMap[st] += 1;
      else statusMap[st] = 1;

      const dept = inv.department || "General";
      departmentRevenue[dept] = (departmentRevenue[dept] || 0) + finalAmt;
    });

    const outstandingBalance = Math.max(0, grossBilled - netCollected);
    const collectionEfficiency = grossBilled > 0 ? `${Math.round((netCollected / grossBilled) * 100)}%` : "0%";

    return {
      grossBilled,
      netCollected,
      outstandingBalance,
      discountTotal,
      taxTotal,
      collectionEfficiency,
      invoiceStatuses: statusMap,
      departmentRevenue,
      recentInvoices: invoices.slice(0, 20)
    };
  }

  // 16. Insurance & TPA Reports
  async getInsuranceReport(timeframe?: string) {
    const claims = await InsuranceClaim.find()
      .populate("providerId", "name code type slaDays")
      .populate("patientId", "name uhid")
      .sort({ createdAt: -1 })
      .lean();

    let totalClaimed = 0;
    let totalSettled = 0;
    let totalDisallowed = 0;
    const providerMap: Record<string, { name: string; count: number; claimed: number; settled: number; disallowed: number }> = {};

    claims.forEach((c: any) => {
      const clm = Number(c.amountClaimed || 0);
      const stl = Number(c.amountSettled || 0);
      const dis = Number(c.amountDisallowed || 0);

      totalClaimed += clm;
      totalSettled += stl;
      totalDisallowed += dis;

      const pName = c.providerId?.name || "Direct Carrier";
      if (!providerMap[pName]) {
        providerMap[pName] = { name: pName, count: 0, claimed: 0, settled: 0, disallowed: 0 };
      }
      providerMap[pName].count += 1;
      providerMap[pName].claimed += clm;
      providerMap[pName].settled += stl;
      providerMap[pName].disallowed += dis;
    });

    const overallYield = totalClaimed > 0 ? `${Math.round((totalSettled / totalClaimed) * 100)}%` : "0%";

    return {
      totalClaimsCount: claims.length,
      totalClaimedAmount: totalClaimed,
      totalSettledAmount: totalSettled,
      totalDisallowedAmount: totalDisallowed,
      overallYield,
      providerScorecard: Object.values(providerMap).sort((a, b) => b.claimed - a.claimed),
      recentClaims: claims.slice(0, 15)
    };
  }

  // 17. Department Performance Reports
  async getDepartmentReport(timeframe?: string) {
    const [departments, appointments, invoices, admissions, doctors] = await Promise.all([
      Department.find({ status: "ACTIVE" }).lean(),
      Appointment.find().populate({ path: "doctorId", select: "departmentId" }).lean(),
      Invoice.find().lean(),
      Admission.find().lean(),
      Doctor.find().select("userId departmentId").lean()
    ]);

    const docDeptMap = new Map<string, string>();
    doctors.forEach((doc: any) => {
      if (doc._id && doc.departmentId) {
        docDeptMap.set(doc._id.toString(), doc.departmentId.toString());
      }
    });

    const userDeptMap = new Map<string, string>();
    doctors.forEach((doc: any) => {
      if (doc.userId && doc.departmentId) {
        userDeptMap.set(doc.userId.toString(), doc.departmentId.toString());
      }
    });

    const deptStats = departments.map((d: any) => {
      const dId = d._id.toString();
      const deptName = d.name;

      const apptCount = appointments.filter((a: any) => {
        const docId = a.doctorId?._id?.toString() || a.doctorId?.toString();
        const deptId = a.doctorId?.departmentId?._id?.toString() || a.doctorId?.departmentId?.toString() || (docId ? docDeptMap.get(docId) : null);
        return deptId === dId;
      }).length;

      const admCount = admissions.filter((a: any) => {
        const docUserId = a.doctorId?._id?.toString() || a.doctorId?.toString();
        const deptId = docUserId ? userDeptMap.get(docUserId) : null;
        return deptId === dId;
      }).length;

      const rev = invoices
        .filter((i: any) => i.department === deptName)
        .reduce((sum: number, i: any) => sum + Number(i.finalAmount || 0), 0);

      return {
        id: dId,
        name: deptName,
        code: d.code || "DEPT",
        appointmentCount: apptCount,
        admissionCount: admCount,
        totalFootfall: apptCount + admCount,
        revenue: rev
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      totalDepartments: departments.length,
      departmentPerformance: deptStats
    };
  }
}

export const reportsService = new ReportsService();
export default reportsService;
