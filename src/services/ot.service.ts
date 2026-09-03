import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { SurgerySchedule, ISurgerySchedule } from "@/models/surgery-schedule.model";
import { OTBooking, IOTBooking } from "@/models/ot-booking.model";
import { SurgeryRequest, ISurgeryRequest } from "@/models/surgery-request.model";
import { PreOpChecklist, IPreOpChecklist } from "@/models/preop-checklist.model";
import { IntraOpRecord, IIntraOpRecord } from "@/models/intraop-record.model";
import { PostOpRecord, IPostOpRecord } from "@/models/postop-record.model";

export class OTService {
  // Live OT Statistics & Capacity Radar
  async getOTStats() {
    await dbConnect();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      todaySurgeries,
      inProgressSurgeries,
      completedSurgeries,
      pendingRequests,
      emergencySurgeries,
      pacClearedCount,
      activeRooms
    ] = await Promise.all([
      SurgerySchedule.countDocuments({
        date: { $gte: todayStart, $lte: todayEnd }
      }),
      SurgerySchedule.countDocuments({ status: "In Progress" }),
      SurgerySchedule.countDocuments({
        status: "Completed",
        date: { $gte: todayStart, $lte: todayEnd }
      }),
      SurgeryRequest.countDocuments({ status: "PENDING" }),
      SurgerySchedule.countDocuments({ urgency: "EMERGENCY_STAT" }),
      SurgerySchedule.countDocuments({ preOpCleared: true }),
      SurgerySchedule.find({ status: "In Progress" }).select("otRoom")
    ]);

    const occupiedSuites = new Set(activeRooms.map((s) => s.otRoom).filter(Boolean)).size;
    const totalSuites = 5;
    const availableRooms = Math.max(0, totalSuites - occupiedSuites);

    return {
      todaySurgeries,
      inProgressSurgeries,
      completedSurgeries,
      pendingRequests,
      emergencySurgeries,
      pacClearedCount,
      totalSuites,
      occupiedSuites,
      availableRooms
    };
  }

  // Surgery Schedules
  async createSchedule(data: Partial<ISurgerySchedule>) {
    await dbConnect();
    if (!data.surgeryCode) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.surgeryCode = `SURG-${todayStr}-${randomSuffix}`;
    }

    const schedule = new SurgerySchedule(data);
    const saved = await schedule.save();

    // Also create corresponding PreOp Checklist entry
    const checklist = new PreOpChecklist({
      checklistCode: `PREOP-${Math.floor(100000 + Math.random() * 900000)}`,
      surgeryScheduleId: saved._id,
      patientId: saved.patientId,
      patientName: saved.patientName,
      uhid: saved.uhid,
      surgeryName: saved.surgeryName,
      asaGrade: saved.asaGrade || "ASA II",
      pacCleared: saved.preOpCleared || false
    });
    await checklist.save();

    return saved;
  }

  async getSchedules(filter: any = {}) {
    await dbConnect();
    return await SurgerySchedule.find(filter)
      .populate("patientId", "name uhid age gender phone")
      .sort({ date: 1, time: 1 });
  }

  async getScheduleById(id: string | Types.ObjectId) {
    await dbConnect();
    return await SurgerySchedule.findById(id).populate("patientId");
  }

  async updateSchedule(id: string | Types.ObjectId, data: Partial<ISurgerySchedule>) {
    await dbConnect();
    return await SurgerySchedule.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSchedule(id: string | Types.ObjectId) {
    await dbConnect();
    return await SurgerySchedule.findByIdAndDelete(id);
  }

  // OT Room Bookings
  async createBooking(data: Partial<IOTBooking>) {
    await dbConnect();
    if (!data.bookingNumber) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.bookingNumber = `OTB-${todayStr}-${randomSuffix}`;
    }
    const booking = new OTBooking(data);
    return await booking.save();
  }

  async getBookings(filter: any = {}) {
    await dbConnect();
    return await OTBooking.find(filter)
      .populate("surgeryScheduleId")
      .sort({ bookingDate: 1 });
  }

  async updateBooking(id: string | Types.ObjectId, data: Partial<IOTBooking>) {
    await dbConnect();
    return await OTBooking.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteBooking(id: string | Types.ObjectId) {
    await dbConnect();
    return await OTBooking.findByIdAndDelete(id);
  }

  // Surgery Requests
  async createRequest(data: Partial<ISurgeryRequest>) {
    await dbConnect();
    if (!data.requestCode) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.requestCode = `SREQ-${todayStr}-${randomSuffix}`;
    }
    const req = new SurgeryRequest(data);
    return await req.save();
  }

  async getRequests(filter: any = {}) {
    await dbConnect();
    return await SurgeryRequest.find(filter)
      .populate("patientId")
      .sort({ preferredDate: 1 });
  }

  async updateRequest(id: string | Types.ObjectId, data: Partial<ISurgeryRequest>) {
    await dbConnect();
    return await SurgeryRequest.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteRequest(id: string | Types.ObjectId) {
    await dbConnect();
    return await SurgeryRequest.findByIdAndDelete(id);
  }

  // Pre-Op Checklists
  async createPreOpChecklist(data: Partial<IPreOpChecklist>) {
    await dbConnect();
    if (!data.checklistCode) {
      data.checklistCode = `PREOP-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    const checklist = new PreOpChecklist(data);
    const saved = await checklist.save();

    if (data.surgeryScheduleId && data.pacCleared) {
      await SurgerySchedule.findByIdAndUpdate(data.surgeryScheduleId, {
        preOpCleared: true
      });
    }

    return saved;
  }

  async getPreOpChecklists(filter: any = {}) {
    await dbConnect();
    return await PreOpChecklist.find(filter)
      .populate("surgeryScheduleId")
      .sort({ createdAt: -1 });
  }

  async updatePreOpChecklist(id: string | Types.ObjectId, data: Partial<IPreOpChecklist>) {
    await dbConnect();
    const updated = await PreOpChecklist.findByIdAndUpdate(id, data, { new: true });
    if (updated && updated.surgeryScheduleId && updated.pacCleared) {
      await SurgerySchedule.findByIdAndUpdate(updated.surgeryScheduleId, {
        preOpCleared: true
      });
    }
    return updated;
  }

  // Intra-Op Records
  async createIntraOpRecord(data: Partial<IIntraOpRecord>) {
    await dbConnect();
    if (!data.recordCode) {
      data.recordCode = `INTR-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    const record = new IntraOpRecord(data);
    const saved = await record.save();

    if (data.surgeryScheduleId) {
      await SurgerySchedule.findByIdAndUpdate(data.surgeryScheduleId, {
        status: "In Progress"
      });
    }

    return saved;
  }

  async getIntraOpRecords(filter: any = {}) {
    await dbConnect();
    return await IntraOpRecord.find(filter)
      .populate("surgeryScheduleId")
      .sort({ createdAt: -1 });
  }

  // Post-Op PACU Records
  async createPostOpRecord(data: Partial<IPostOpRecord>) {
    await dbConnect();
    if (!data.recordCode) {
      data.recordCode = `POST-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    const record = new PostOpRecord(data);
    const saved = await record.save();

    if (data.surgeryScheduleId) {
      await SurgerySchedule.findByIdAndUpdate(data.surgeryScheduleId, {
        status: "Recovery"
      });
    }

    return saved;
  }

  async getPostOpRecords(filter: any = {}) {
    await dbConnect();
    return await PostOpRecord.find(filter)
      .populate("surgeryScheduleId")
      .sort({ createdAt: -1 });
  }

  // Comprehensive OT Seeder
  async seedOTSampleCases() {
    await dbConnect();

    const sampleCases = [
      {
        surgeryCode: "SURG-20260903-101",
        patientName: "Dr. Arvind Subramaniam",
        uhid: "UHID-20911",
        surgeryName: "Off-Pump Coronary Artery Bypass Grafting (OPCAB / CABG x 3)",
        specialty: "Cardiothoracic" as const,
        surgeon: "Dr. Rajeshwar Naidu (Sr. CTVS Surgeon)",
        assistantSurgeon: "Dr. Alok Verma",
        anesthesiologist: "Dr. Sunita Kapoor (Chief Cardiac Anesthetist)",
        scrubNurse: "Sister Mary Varghese",
        circulatingNurse: "Staff Nurse Praveen",
        date: new Date(),
        time: "08:30 AM",
        duration: 240,
        otRoom: "OT 1 - Modular Cardiac OT",
        anesthesiaType: "General Anesthesia (GA)" as const,
        asaGrade: "ASA IV" as const,
        urgency: "URGENT" as const,
        preOpCleared: true,
        estimatedCost: 285000,
        status: "In Progress" as const,
        preOpNotes: "High risk consent obtained. 4 units PRBC crossmatched and in OT refrigerator."
      },
      {
        surgeryCode: "SURG-20260903-102",
        patientName: "Kamleshwar Singh",
        uhid: "UHID-20912",
        surgeryName: "Right Frontotemporoparietal Decompressive Craniectomy for SDH",
        specialty: "Neurosurgery" as const,
        surgeon: "Dr. Vikramaditya Sen (Neurosurgeon)",
        assistantSurgeon: "Dr. Priya Roy",
        anesthesiologist: "Dr. Amit Bansal (Neuro-Anesthetist)",
        scrubNurse: "Sister Anjali Rao",
        circulatingNurse: "Staff Nurse Dinesh",
        date: new Date(),
        time: "10:00 AM",
        duration: 180,
        otRoom: "OT 2 - Neuro-Trauma OT",
        anesthesiaType: "General Anesthesia (GA)" as const,
        asaGrade: "ASA E (Emergency)" as const,
        urgency: "EMERGENCY_STAT" as const,
        preOpCleared: true,
        estimatedCost: 195000,
        status: "In Progress" as const,
        preOpNotes: "Trauma emergency. Dilated right pupil. Operating microscope reserved."
      },
      {
        surgeryCode: "SURG-20260903-103",
        patientName: "Mrs. Shashi Prabha",
        uhid: "UHID-20913",
        surgeryName: "Left Total Knee Arthroplasty (TKA / Robotic Navigation)",
        specialty: "Orthopedics" as const,
        surgeon: "Dr. Harpreet Chawla (Joint Replacement Surgeon)",
        assistantSurgeon: "Dr. Rahul Joshi",
        anesthesiologist: "Dr. Meenakshi Sundaram",
        scrubNurse: "Sister Rekha Nair",
        circulatingNurse: "Staff Nurse Manoj",
        date: new Date(),
        time: "01:30 PM",
        duration: 120,
        otRoom: "OT 3 - Orthopedic & Joint Replacement OT",
        anesthesiaType: "Spinal Anesthesia" as const,
        asaGrade: "ASA II" as const,
        urgency: "ELECTIVE" as const,
        preOpCleared: true,
        estimatedCost: 175000,
        status: "Scheduled" as const,
        preOpNotes: "Stryker Triathlon implant size 4 confirmed. Laminar airflow validated."
      },
      {
        surgeryCode: "SURG-20260903-104",
        patientName: "Gaurav Malhotra",
        uhid: "UHID-20914",
        surgeryName: "Laparoscopic Cholecystectomy (4-Port Technique)",
        specialty: "General & GI Surgery" as const,
        surgeon: "Dr. S. K. Mukherjee (GI Laparoscopic Surgeon)",
        assistantSurgeon: "Dr. Neha Mittal",
        anesthesiologist: "Dr. Amit Bansal",
        scrubNurse: "Sister Deepa George",
        circulatingNurse: "Staff Nurse Praveen",
        date: new Date(),
        time: "03:30 PM",
        duration: 75,
        otRoom: "OT 4 - Laparoscopic & GI OT",
        anesthesiaType: "General Anesthesia (GA)" as const,
        asaGrade: "ASA I" as const,
        urgency: "ELECTIVE" as const,
        preOpCleared: true,
        estimatedCost: 65000,
        status: "Scheduled" as const,
        preOpNotes: "Karl Storz 4K tower reserved. Harmonic scalpel handpiece tested."
      }
    ];

    for (const cData of sampleCases) {
      const existing = await SurgerySchedule.findOne({ surgeryCode: cData.surgeryCode });
      if (!existing) {
        const schedule = new SurgerySchedule(cData);
        const saved = await schedule.save();

        // Create Pre-op Checklist
        await PreOpChecklist.create({
          checklistCode: `PREOP-${Math.floor(100000 + Math.random() * 900000)}`,
          surgeryScheduleId: saved._id,
          patientName: saved.patientName,
          uhid: saved.uhid,
          surgeryName: saved.surgeryName,
          patientIdentityConfirmed: true,
          surgicalSiteMarked: true,
          consentConfirmed: true,
          anesthesiaMachineChecked: true,
          pulseOximeterFunctioning: true,
          knownAllergy: false,
          difficultAirwayRisk: saved.specialty === "Cardiothoracic",
          bloodLossRiskOver500ml: saved.specialty === "Cardiothoracic" || saved.specialty === "Neurosurgery",
          bloodUnitsArranged: saved.specialty === "Cardiothoracic" ? 4 : 2,
          npoFastingHours: 8,
          premedicationGiven: true,
          asaGrade: saved.asaGrade,
          pacCleared: true,
          status: "COMPLIANT"
        });

        // Create OT Booking with Equipment
        await OTBooking.create({
          bookingNumber: `OTB-${Math.floor(100000 + Math.random() * 900000)}`,
          surgeryScheduleId: saved._id,
          patientName: saved.patientName,
          otRoom: saved.otRoom,
          bookingDate: new Date(),
          slotStartTime: saved.time,
          slotEndTime: "05:00 PM",
          procedureName: saved.surgeryName,
          surgeonName: saved.surgeon,
          equipmentRequired:
            saved.specialty === "Cardiothoracic"
              ? ["Heart-Lung Machine (CPB)", "IABP Console", "Sternal Saw", "ACT Meter"]
              : saved.specialty === "Neurosurgery"
              ? ["Operating Microscope", "CUSA Ultrasonic Aspirator", "High Speed Drill"]
              : saved.specialty === "Orthopedics"
              ? ["C-Arm Fluoroscopy", "Robotic Navigation Console", "Pneumatic Tourniquet"]
              : ["4K Laparoscopy Tower", "Harmonic Scalpel", "CO2 Insufflator"],
          equipmentRentalCost: saved.specialty === "Cardiothoracic" ? 35000 : 15000,
          status: "Confirmed"
        });

        // Create IntraOp record for in-progress surgery
        if (saved.status === "In Progress") {
          await IntraOpRecord.create({
            recordCode: `INTR-${Math.floor(100000 + Math.random() * 900000)}`,
            surgeryScheduleId: saved._id,
            patientName: saved.patientName,
            uhid: saved.uhid,
            surgeryName: saved.surgeryName,
            otRoom: saved.otRoom,
            timeOutConfirmed: true,
            incisionTime: saved.time,
            closureTime: "Pending Closure",
            operatingSurgeon: saved.surgeon,
            assistantSurgeon: saved.assistantSurgeon,
            anesthetist: saved.anesthesiologist,
            scrubNurse: saved.scrubNurse,
            circulatingNurse: saved.circulatingNurse,
            surgicalFindings: "Severe triple vessel disease with calcified LAD and RCA.",
            procedureDescription: "LIMA mobilized and harvested. Left radial artery graft prepared. Heparinized.",
            estimatedBloodLoss: 250,
            bloodTransfusedUnits: 1,
            urineOutput: 350,
            swabCountCorrect: true,
            needleAndInstrumentCountCorrect: true,
            specimenSentToBiopsy: false
          });
        }
      }
    }

    // Seed Sample Surgery Request
    const existingReq = await SurgeryRequest.findOne({ requestCode: "SREQ-20260903-801" });
    if (!existingReq) {
      await SurgeryRequest.create({
        requestCode: "SREQ-20260903-801",
        patientName: "Subhashini Rao",
        uhid: "UHID-20915",
        requestingDoctor: "Dr. Alok Verma",
        department: "Urology",
        procedureProposed: "Left Percutaneous Nephrolithotomy (PCNL) for Staghorn Calculus",
        diagnosis: "Left Renal Staghorn Calculus with hydronephrosis",
        urgency: "ELECTIVE",
        preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        estimatedDuration: 90,
        pacCleared: true,
        bloodArrangementRequired: true,
        bloodUnits: 2,
        status: "PENDING"
      });
    }

    return {
      success: true,
      message: "Seeded 4 multi-specialty surgical cases with WHO checklists, bookings, and intra-op logs."
    };
  }
}

export const otService = new OTService();
export default otService;
