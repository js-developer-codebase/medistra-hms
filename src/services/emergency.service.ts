import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { EmergencyTriage, IEmergencyTriage } from "@/models/emergency-triage.model";
import { CasualtyRecord, ICasualtyRecord } from "@/models/casualty-record.model";
import { EmergencyOrder, IEmergencyOrder } from "@/models/emergency-order.model";
import { EmergencyTreatment, IEmergencyTreatment } from "@/models/emergency-treatment.model";
import { EmergencyConsultation, IEmergencyConsultation } from "@/models/emergency-consultation.model";

export class EmergencyService {
  // Statistics & KPI Dashboard
  async getEmergencyStats() {
    await dbConnect();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      activeCasualties,
      criticalRedOrange,
      pendingOrders,
      todayCasualties,
      todayAdmitted,
      todayDischarged,
      mlcCount,
      allActive
    ] = await Promise.all([
      CasualtyRecord.countDocuments({
        status: { $in: ["REGISTERED", "TRIAGED", "IN_CONSULTATION", "UNDER_TREATMENT"] }
      }),
      EmergencyTriage.countDocuments({
        priority: { $in: ["Red", "Orange"] },
        status: { $in: ["Waiting", "In Treatment"] }
      }),
      EmergencyOrder.countDocuments({
        status: { $in: ["ORDERED", "IN_PROGRESS"] }
      }),
      CasualtyRecord.countDocuments({
        createdAt: { $gte: todayStart }
      }),
      CasualtyRecord.countDocuments({
        status: "ADMITTED",
        updatedAt: { $gte: todayStart }
      }),
      CasualtyRecord.countDocuments({
        status: "DISCHARGED",
        updatedAt: { $gte: todayStart }
      }),
      CasualtyRecord.countDocuments({
        isMLC: true
      }),
      CasualtyRecord.find({
        status: { $in: ["REGISTERED", "TRIAGED", "IN_CONSULTATION", "UNDER_TREATMENT"] }
      }).select("assignedBay")
    ]);

    const occupiedBays = new Set(
      allActive.map((c) => c.assignedBay).filter(Boolean)
    ).size;

    return {
      activeCasualties,
      criticalRedOrange,
      occupiedBays,
      pendingOrders,
      todayCasualties,
      todayAdmitted,
      todayDischarged,
      mlcCount
    };
  }

  // Casualty Records
  async createCasualty(data: Partial<ICasualtyRecord>) {
    await dbConnect();
    if (!data.caseNumber) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.caseNumber = `ER-${todayStr}-${randomSuffix}`;
    }

    const casualty = new CasualtyRecord(data);
    const savedCasualty = await casualty.save();

    // Automatically create a corresponding initial Triage record
    const triageData = {
      casualtyId: savedCasualty._id,
      patientId: savedCasualty.patientId,
      patientName: savedCasualty.patientName,
      uhid: savedCasualty.uhid,
      esiLevel: "Level 3 - Urgent" as const,
      priority: (savedCasualty.triagePriority || "Yellow") as any,
      chiefComplaint: savedCasualty.chiefComplaints || "Acute illness under evaluation",
      assignedBay: savedCasualty.assignedBay || "Acute Bay 1",
      status: "Waiting" as const
    };

    const triage = new EmergencyTriage(triageData);
    const savedTriage = await triage.save();

    // Link triage back to casualty
    savedCasualty.triageId = savedTriage._id;
    await savedCasualty.save();

    return savedCasualty;
  }

  async getCasualties(filter: any = {}) {
    await dbConnect();
    return await CasualtyRecord.find(filter)
      .populate("patientId", "name uhid age gender phone")
      .populate("assignedDoctor", "name specialization")
      .populate("triageId")
      .sort({ createdAt: -1 });
  }

  async getCasualtyById(id: string | Types.ObjectId) {
    await dbConnect();
    return await CasualtyRecord.findById(id)
      .populate("patientId")
      .populate("assignedDoctor")
      .populate("triageId");
  }

  async updateCasualty(id: string | Types.ObjectId, data: Partial<ICasualtyRecord>) {
    await dbConnect();
    return await CasualtyRecord.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCasualty(id: string | Types.ObjectId) {
    await dbConnect();
    return await CasualtyRecord.findByIdAndDelete(id);
  }

  // Triage Records
  async createTriage(data: Partial<IEmergencyTriage>) {
    await dbConnect();
    const triage = new EmergencyTriage(data);
    const saved = await triage.save();

    // If casualtyId is present, update the casualty's priority and status
    if (data.casualtyId) {
      await CasualtyRecord.findByIdAndUpdate(data.casualtyId, {
        triagePriority: data.priority || "Yellow",
        triageId: saved._id,
        status: "TRIAGED",
        assignedBay: data.assignedBay
      });
    }

    return saved;
  }

  async getTriages(filter: any = {}) {
    await dbConnect();
    return await EmergencyTriage.find(filter)
      .populate("casualtyId")
      .populate("patientId")
      .populate("assignedDoctor")
      .sort({ createdAt: -1 });
  }

  async updateTriage(id: string | Types.ObjectId, data: Partial<IEmergencyTriage>) {
    await dbConnect();
    const updated = await EmergencyTriage.findByIdAndUpdate(id, data, { new: true });
    if (updated && updated.casualtyId) {
      await CasualtyRecord.findByIdAndUpdate(updated.casualtyId, {
        triagePriority: updated.priority,
        assignedBay: updated.assignedBay
      });
    }
    return updated;
  }

  // STAT Orders
  async createOrder(data: Partial<IEmergencyOrder>) {
    await dbConnect();
    if (!data.orderNumber) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.orderNumber = `ERO-${todayStr}-${randomSuffix}`;
    }

    const order = new EmergencyOrder(data);
    return await order.save();
  }

  async getOrders(filter: any = {}) {
    await dbConnect();
    return await EmergencyOrder.find(filter)
      .populate("casualtyId")
      .sort({ createdAt: -1 });
  }

  async updateOrder(id: string | Types.ObjectId, data: Partial<IEmergencyOrder>) {
    await dbConnect();
    return await EmergencyOrder.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteOrder(id: string | Types.ObjectId) {
    await dbConnect();
    return await EmergencyOrder.findByIdAndDelete(id);
  }

  // Emergency Treatment & Procedures
  async createTreatment(data: Partial<IEmergencyTreatment>) {
    await dbConnect();
    if (!data.treatmentCode) {
      data.treatmentCode = `TRT-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    const treatment = new EmergencyTreatment(data);
    const saved = await treatment.save();

    if (data.casualtyId) {
      await CasualtyRecord.findByIdAndUpdate(data.casualtyId, {
        status: "UNDER_TREATMENT"
      });
    }

    return saved;
  }

  async getTreatments(filter: any = {}) {
    await dbConnect();
    return await EmergencyTreatment.find(filter)
      .populate("casualtyId")
      .sort({ createdAt: -1 });
  }

  // Emergency Consultations
  async createConsultation(data: Partial<IEmergencyConsultation>) {
    await dbConnect();
    if (!data.consultationCode) {
      data.consultationCode = `CON-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    const consultation = new EmergencyConsultation(data);
    const saved = await consultation.save();

    if (data.casualtyId) {
      await CasualtyRecord.findByIdAndUpdate(data.casualtyId, {
        status: "IN_CONSULTATION"
      });
    }

    return saved;
  }

  async getConsultations(filter: any = {}) {
    await dbConnect();
    return await EmergencyConsultation.find(filter)
      .populate("casualtyId")
      .sort({ createdAt: -1 });
  }

  // Escalation: Inpatient Admission
  async processAdmission(casualtyId: string, payload: any) {
    await dbConnect();
    const casualty = await CasualtyRecord.findById(casualtyId);
    if (!casualty) throw new Error("Casualty record not found");

    casualty.status = "ADMITTED";
    casualty.dispositionNotes = `Admitted to ${payload.wardType || "ICU"}. ${payload.notes || ""}`;
    await casualty.save();

    return {
      success: true,
      message: `Patient ${casualty.patientName} admitted to ${payload.wardType || "Inpatient Ward"}.`,
      data: casualty
    };
  }

  // Disposition: Discharge
  async processDischarge(casualtyId: string, payload: any) {
    await dbConnect();
    const casualty = await CasualtyRecord.findById(casualtyId);
    if (!casualty) throw new Error("Casualty record not found");

    const dispositionStatus =
      payload.disposition === "DECEASED"
        ? "EXPIRED"
        : payload.disposition === "TRANSFER_TERTIARY"
        ? "TRANSFERRED"
        : "DISCHARGED";

    casualty.status = dispositionStatus as any;
    casualty.dispositionNotes = `Discharge Outcome: ${payload.disposition}. Advice: ${payload.notes || "Home rest & medications"}`;
    await casualty.save();

    return {
      success: true,
      message: `Patient ${casualty.patientName} status updated to ${dispositionStatus}.`,
      data: casualty
    };
  }
}

export const emergencyService = new EmergencyService();
export default emergencyService;

