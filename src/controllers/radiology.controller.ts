import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import radiologyService from "@/services/radiology.service";

export class RadiologyController {
  async getOrders(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await radiologyService.getOrders();
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async createOrder(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await radiologyService.createOrder(body);
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async getStudies(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await radiologyService.getStudies();
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
}

export default new RadiologyController();
