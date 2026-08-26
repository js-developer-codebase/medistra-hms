import { Types } from "mongoose";
import { SurgerySchedule, ISurgerySchedule } from "@/models/surgery-schedule.model";
import { OTBooking, IOTBooking } from "@/models/ot-booking.model";

export class OTService {
  async createSchedule(data: Partial<ISurgerySchedule>) {
    const schedule = new SurgerySchedule(data);
    return await schedule.save();
  }
  async getSchedules() {
    return await SurgerySchedule.find().sort({ date: 1 });
  }

  async createBooking(data: Partial<IOTBooking>) {
    const booking = new OTBooking(data);
    return await booking.save();
  }
  async getBookings() {
    return await OTBooking.find().populate("surgeryScheduleId").sort({ bookingDate: 1 });
  }
}

export default new OTService();
