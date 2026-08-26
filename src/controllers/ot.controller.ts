import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import otService from "@/services/ot.service";

export class OTController {
  async createSchedule(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const schedule = await otService.createSchedule(data);
      return NextResponse.json({ success: true, data: schedule }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }
  async getSchedules(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const schedules = await otService.getSchedules();
      return NextResponse.json({ success: true, data: schedules });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async createBooking(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const booking = await otService.createBooking(data);
      return NextResponse.json({ success: true, data: booking }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }
  async getBookings(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const bookings = await otService.getBookings();
      return NextResponse.json({ success: true, data: bookings });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }
}

export default new OTController();
