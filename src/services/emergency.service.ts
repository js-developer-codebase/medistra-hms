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

  // Seeder for Sample Emergency Cases
  async seedEmergencySampleCases() {
    await dbConnect();

    const sampleCases = [
      {
        caseNumber: `ER-20260903-1001`,
        patientName: "Vikramaditya Sharma",
        uhid: "UHID-10829",
        age: 58,
        gender: "Male" as const,
        contactNumber: "+91 98112 34567",
        arrivalTime: new Date(Date.now() - 35 * 60 * 1000), // 35 mins ago
        modeOfArrival: "Ambulance" as const,
        broughtBy: "CAT Ambulance 102",
        broughtByPhone: "+91 102",
        isMLC: false,
        chiefComplaints: "Severe retrosternal crushing chest pain radiating to left arm, diaphoresis & dyspnea",
        initialAssessment: "Suspected Acute Anterior Wall STEMI. Critical cardiac monitoring initiated.",
        triagePriority: "Red" as const,
        assignedBay: "Resuscitation Bay 1",
        status: "UNDER_TREATMENT" as const
      },
      {
        caseNumber: `ER-20260903-1002`,
        patientName: "Ananya Deshmukh",
        uhid: "UHID-10830",
        age: 26,
        gender: "Female" as const,
        contactNumber: "+91 97223 45678",
        arrivalTime: new Date(Date.now() - 55 * 60 * 1000), // 55 mins ago
        modeOfArrival: "Police" as const,
        broughtBy: "PCR Van 42 (ASI R. Singh)",
        broughtByPhone: "+91 98711 00000",
        isMLC: true,
        mlcNumber: "MLC-2026-089",
        policeStation: "Connaught Place Police Station",
        constableDetails: "Head Constable Virender (Badge #4491)",
        chiefComplaints: "Road Traffic Accident (Two-wheeler vs Car), head laceration, left clavicle deformity",
        initialAssessment: "Poly-trauma RTA. Conscious, scalp bleeding controlled. Suspected left clavicle fracture.",
        triagePriority: "Orange" as const,
        assignedBay: "Trauma Bay",
        status: "IN_CONSULTATION" as const
      },
      {
        caseNumber: `ER-20260903-1003`,
        patientName: "Master Kabir Mehra",
        uhid: "UHID-10831",
        age: 6,
        gender: "Male" as const,
        contactNumber: "+91 98450 12345",
        arrivalTime: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
        modeOfArrival: "Walk-in" as const,
        broughtBy: "Mrs. Mehra (Mother)",
        broughtByPhone: "+91 98450 12345",
        attendantRelation: "Mother",
        isMLC: false,
        chiefComplaints: "High grade fever (103.5°F), febrile twitching episode at home, lethargy",
        initialAssessment: "Pediatric Febrile Convulsion episode. Active fever reduction with cold sponging.",
        triagePriority: "Yellow" as const,
        assignedBay: "Acute Bay 2",
        status: "TRIAGED" as const
      },
      {
        caseNumber: `ER-20260903-1004`,
        patientName: "Rajesh Kumar Gupta",
        uhid: "UHID-10832",
        age: 42,
        gender: "Male" as const,
        contactNumber: "+91 99100 87654",
        arrivalTime: new Date(Date.now() - 75 * 60 * 1000), // 75 mins ago
        modeOfArrival: "Walk-in" as const,
        broughtBy: "Self",
        isMLC: false,
        chiefComplaints: "Deep laceration on right forearm while handling glass window, bleeding stopped with bandage",
        initialAssessment: "Clean incised wound 5cm on right flexor forearm. Tendons and nerves intact.",
        triagePriority: "Green" as const,
        assignedBay: "Procedure Room 1",
        status: "UNDER_TREATMENT" as const
      }
    ];

    for (const cData of sampleCases) {
      const existing = await CasualtyRecord.findOne({ caseNumber: cData.caseNumber });
      if (!existing) {
        const casualty = new CasualtyRecord(cData);
        const savedCasualty = await casualty.save();

        // Create Triage
        const triage = new EmergencyTriage({
          casualtyId: savedCasualty._id,
          patientName: savedCasualty.patientName,
          uhid: savedCasualty.uhid,
          esiLevel:
            savedCasualty.triagePriority === "Red"
              ? "Level 1 - Resuscitation"
              : savedCasualty.triagePriority === "Orange"
              ? "Level 2 - Emergent"
              : savedCasualty.triagePriority === "Yellow"
              ? "Level 3 - Urgent"
              : "Level 4 - Less Urgent",
          priority: savedCasualty.triagePriority,
          chiefComplaint: savedCasualty.chiefComplaints,
          vitals:
            savedCasualty.triagePriority === "Red"
              ? { bp: "85/55", heartRate: 122, respiratoryRate: 26, temperature: 98.4, spo2: 91, gcsScore: 14, painScale: 10, bloodGlucose: 145 }
              : savedCasualty.triagePriority === "Orange"
              ? { bp: "135/88", heartRate: 98, respiratoryRate: 20, temperature: 98.8, spo2: 97, gcsScore: 15, painScale: 8, bloodGlucose: 112 }
              : { bp: "115/75", heartRate: 110, respiratoryRate: 22, temperature: 103.5, spo2: 99, gcsScore: 15, painScale: 4, bloodGlucose: 95 },
          primarySurvey: {
            airway: "Patent",
            breathing: savedCasualty.triagePriority === "Red" ? "Tachypneic" : "Normal",
            circulation: savedCasualty.triagePriority === "Red" ? "Shock / Hypotensive" : "Stable",
            disability: "Alert",
            exposure: savedCasualty.isMLC ? "Poly-trauma / Hemorrhage" : "Normal"
          },
          assignedBay: savedCasualty.assignedBay,
          triagedBy: "Sr. Triage Sister Sunita",
          status: "In Treatment"
        });
        const savedTriage = await triage.save();
        savedCasualty.triageId = savedTriage._id;
        await savedCasualty.save();

        // Add STAT Orders
        if (savedCasualty.triagePriority === "Red") {
          await EmergencyOrder.create({
            orderNumber: `ERO-20260903-881`,
            casualtyId: savedCasualty._id,
            patientName: savedCasualty.patientName,
            uhid: savedCasualty.uhid,
            orderType: "LAB",
            itemName: "Cardiac Biomarkers (Troponin-I STAT & CK-MB)",
            priority: "STAT",
            cost: 1850,
            status: "IN_PROGRESS"
          });
          await EmergencyOrder.create({
            orderNumber: `ERO-20260903-882`,
            casualtyId: savedCasualty._id,
            patientName: savedCasualty.patientName,
            uhid: savedCasualty.uhid,
            orderType: "MEDICATION",
            itemName: "Aspirin 325mg + Clopidogrel 300mg Loading Dose + IV Heparin",
            priority: "STAT",
            cost: 450,
            status: "COMPLETED"
          });
        } else if (savedCasualty.triagePriority === "Orange") {
          await EmergencyOrder.create({
            orderNumber: `ERO-20260903-883`,
            casualtyId: savedCasualty._id,
            patientName: savedCasualty.patientName,
            uhid: savedCasualty.uhid,
            orderType: "IMAGING",
            itemName: "STAT Portable Left Clavicle & Shoulder AP X-Ray",
            priority: "STAT",
            cost: 850,
            status: "ORDERED"
          });
        }

        // Add Treatment / Procedure
        if (savedCasualty.triagePriority === "Green") {
          await EmergencyTreatment.create({
            treatmentCode: "TRT-90021",
            casualtyId: savedCasualty._id,
            patientName: savedCasualty.patientName,
            uhid: savedCasualty.uhid,
            procedureCategory: "WOUND_TRAUMA",
            procedureName: "Forearm Laceration Wound Debridement & Primary Suturing (4-0 Ethilon)",
            performedBy: "Dr. Arvind (ER Medical Officer)",
            equipmentUsed: "Minor surgical suture pack, 2% Lignocaine",
            outcomeNotes: "Healed primary closure completed with 5 interrupted sutures. TT 0.5ml given IM."
          });
        }
      }
    }

    return {
      success: true,
      message: "Seeded 4 realistic emergency and trauma casualty cases with triages, orders, and treatments."
    };
  }
}

export const emergencyService = new EmergencyService();
export default emergencyService;
