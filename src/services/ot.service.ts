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
}

export const otService = new OTService();
export default otService;

