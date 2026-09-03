import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import emergencyService from "@/services/emergency.service";

export class EmergencyController {
  // Stats
  async getStats(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const stats = await emergencyService.getEmergencyStats();
      return NextResponse.json({ success: true, data: stats });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Casualty CRUD
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
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const priority = searchParams.get("priority");
      const isMLC = searchParams.get("isMLC");

      const filter: any = {};
      if (status && status !== "ALL") filter.status = status;
      if (priority && priority !== "ALL") filter.triagePriority = priority;
      if (isMLC !== null && isMLC !== undefined && isMLC !== "") {
        filter.isMLC = isMLC === "true";
      }

      const casualties = await emergencyService.getCasualties(filter);
      return NextResponse.json({ success: true, data: casualties });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getCasualtyById(
    request: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    try {
      await dbConnect();
      const casualty = await emergencyService.getCasualtyById(params.id);
      if (!casualty) {
        return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: casualty });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateCasualty(
    request: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const casualty = await emergencyService.updateCasualty(params.id, data);
      return NextResponse.json({ success: true, data: casualty });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async deleteCasualty(
    request: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    try {
      await dbConnect();
      await emergencyService.deleteCasualty(params.id);
      return NextResponse.json({ success: true, message: "Deleted" });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

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
      const { searchParams } = new URL(request.url);
      const priority = searchParams.get("priority");
      const filter: any = {};
      if (priority && priority !== "ALL") filter.priority = priority;

      const triages = await emergencyService.getTriages(filter);
      return NextResponse.json({ success: true, data: triages });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateTriage(
    request: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const triage = await emergencyService.updateTriage(new Types.ObjectId(params.id), data);
      return NextResponse.json({ success: true, data: triage });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // STAT Orders
  async createOrder(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const order = await emergencyService.createOrder(data);
      return NextResponse.json({ success: true, data: order }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getOrders(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const casualtyId = searchParams.get("casualtyId");
      const filter: any = {};
      if (casualtyId) filter.casualtyId = casualtyId;

      const orders = await emergencyService.getOrders(filter);
      return NextResponse.json({ success: true, data: orders });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateOrder(
    request: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const order = await emergencyService.updateOrder(params.id, data);
      return NextResponse.json({ success: true, data: order });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async deleteOrder(
    request: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    try {
      await dbConnect();
      await emergencyService.deleteOrder(params.id);
      return NextResponse.json({ success: true, message: "Order deleted" });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Treatments
  async createTreatment(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const treatment = await emergencyService.createTreatment(data);
      return NextResponse.json({ success: true, data: treatment }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getTreatments(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const casualtyId = searchParams.get("casualtyId");
      const filter: any = {};
      if (casualtyId) filter.casualtyId = casualtyId;

      const treatments = await emergencyService.getTreatments(filter);
      return NextResponse.json({ success: true, data: treatments });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Consultations
  async createConsultation(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const consultation = await emergencyService.createConsultation(data);
      return NextResponse.json({ success: true, data: consultation }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getConsultations(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const casualtyId = searchParams.get("casualtyId");
      const filter: any = {};
      if (casualtyId) filter.casualtyId = casualtyId;

      const consultations = await emergencyService.getConsultations(filter);
      return NextResponse.json({ success: true, data: consultations });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Escalation / Disposition
  async processAdmission(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { casualtyId, ...payload } = await request.json();
      const result = await emergencyService.processAdmission(casualtyId, payload);
      return NextResponse.json(result);
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async processDischarge(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { casualtyId, ...payload } = await request.json();
      const result = await emergencyService.processDischarge(casualtyId, payload);
      return NextResponse.json(result);
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Sample Seeder
  async seed(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const result = await emergencyService.seedEmergencySampleCases();
      return NextResponse.json(result);
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }
}

export const emergencyController = new EmergencyController();
export default emergencyController;
