import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import otService from "@/services/ot.service";

export class OTController {
  // Stats
  async getStats(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const stats = await otService.getOTStats();
      return NextResponse.json({ success: true, data: stats });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Schedules
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
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const otRoom = searchParams.get("otRoom");
      const filter: any = {};
      if (status && status !== "ALL") filter.status = status;
      if (otRoom && otRoom !== "ALL") filter.otRoom = otRoom;

      const schedules = await otService.getSchedules(filter);
      return NextResponse.json({ success: true, data: schedules });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getScheduleById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      const schedule = await otService.getScheduleById(params.id);
      if (!schedule) {
        return NextResponse.json({ success: false, message: "Schedule not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: schedule });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateSchedule(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const schedule = await otService.updateSchedule(params.id, data);
      return NextResponse.json({ success: true, data: schedule });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async deleteSchedule(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      await otService.deleteSchedule(params.id);
      return NextResponse.json({ success: true, message: "Schedule deleted" });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Bookings
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

  async updateBooking(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const booking = await otService.updateBooking(params.id, data);
      return NextResponse.json({ success: true, data: booking });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async deleteBooking(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      await otService.deleteBooking(params.id);
      return NextResponse.json({ success: true, message: "Booking cancelled" });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Surgery Requests
  async createRequest(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const req = await otService.createRequest(data);
      return NextResponse.json({ success: true, data: req }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getRequests(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const requests = await otService.getRequests();
      return NextResponse.json({ success: true, data: requests });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateRequest(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const req = await otService.updateRequest(params.id, data);
      return NextResponse.json({ success: true, data: req });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async deleteRequest(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      await otService.deleteRequest(params.id);
      return NextResponse.json({ success: true, message: "Request deleted" });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Pre-Op Checklists
  async createPreOpChecklist(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const checklist = await otService.createPreOpChecklist(data);
      return NextResponse.json({ success: true, data: checklist }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getPreOpChecklists(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const checklists = await otService.getPreOpChecklists();
      return NextResponse.json({ success: true, data: checklists });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updatePreOpChecklist(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const checklist = await otService.updatePreOpChecklist(params.id, data);
      return NextResponse.json({ success: true, data: checklist });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Intra-Op Records
  async createIntraOpRecord(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const record = await otService.createIntraOpRecord(data);
      return NextResponse.json({ success: true, data: record }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getIntraOpRecords(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const records = await otService.getIntraOpRecords();
      return NextResponse.json({ success: true, data: records });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Post-Op PACU Records
  async createPostOpRecord(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const record = await otService.createPostOpRecord(data);
      return NextResponse.json({ success: true, data: record }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getPostOpRecords(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const records = await otService.getPostOpRecords();
      return NextResponse.json({ success: true, data: records });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Seeder
  async seed(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const result = await otService.seedOTSampleCases();
      return NextResponse.json(result);
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }
}

export const otController = new OTController();
export default otController;
