import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import emergencyService from "@/services/emergency.service";

export class EmergencyController {
  // Triage
  async createTriage(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const triage = await emergencyService.createTriage(data);
      return NextResponse.json({ success: true, data: triage }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }
  async getTriages(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const triages = await emergencyService.getTriages();
      return NextResponse.json({ success: true, data: triages });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Casualty
  async createCasualty(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const casualty = await emergencyService.createCasualty(data);
      return NextResponse.json({ success: true, data: casualty }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }
  async getCasualties(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const casualties = await emergencyService.getCasualties();
      return NextResponse.json({ success: true, data: casualties });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }
}

export default new EmergencyController();
