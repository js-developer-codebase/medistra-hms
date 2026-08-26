import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import nursingService from "@/services/nursing.service";

export class NursingController {
  async getCarePlans(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await nursingService.getCarePlans();
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async createCarePlan(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await nursingService.createCarePlan(body);
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async getShifts(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await nursingService.getShifts();
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async getMyPatients(request: NextRequest, nurseId: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await nursingService.getMyPatients(nurseId);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
}

export default new NursingController();
