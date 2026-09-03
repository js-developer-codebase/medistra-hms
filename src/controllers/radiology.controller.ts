import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import radiologyService from "@/services/radiology.service";

export class RadiologyController {
  // --- ORDERS ---
  async getOrders(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") || undefined;
      const priority = searchParams.get("priority") || undefined;
      const modality = searchParams.get("modality") || undefined;
      const patient = searchParams.get("patient") || undefined;
      const accessionNumber = searchParams.get("accessionNumber") || undefined;

      const data = await radiologyService.getOrders({ status, priority, modality, patient, accessionNumber });
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

  async getOrder(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      await dbConnect();
      const { id } = await params;
      const data = await radiologyService.getOrderById(id);
      if (!data) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async updateOrder(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      await dbConnect();
      const { id } = await params;
      const body = await request.json();
      const data = await radiologyService.updateOrder(id, body);
      if (!data) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async deleteOrder(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      await dbConnect();
      const { id } = await params;
      await radiologyService.deleteOrder(id);
      return NextResponse.json({ success: true, data: {} });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // --- PROCEDURES / CATALOG ---
  async getProcedures(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const modality = searchParams.get("modality") || undefined;
      const search = searchParams.get("search") || undefined;

      const data = await radiologyService.getProcedures({ modality, search });
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async createProcedure(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await radiologyService.createProcedure(body);
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async getProcedure(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      await dbConnect();
      const { id } = await params;
      const data = await radiologyService.getProcedureById(id);
      if (!data) return NextResponse.json({ success: false, message: "Procedure not found" }, { status: 404 });
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async updateProcedure(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      await dbConnect();
      const { id } = await params;
      const body = await request.json();
      const data = await radiologyService.updateProcedure(id, body);
      if (!data) return NextResponse.json({ success: false, message: "Procedure not found" }, { status: 404 });
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async deleteProcedure(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      await dbConnect();
      const { id } = await params;
      await radiologyService.deleteProcedure(id);
      return NextResponse.json({ success: true, data: {} });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // --- STUDIES & PACS ---
  async getStudies(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") || undefined;
      const modality = searchParams.get("modality") || undefined;
      const order = searchParams.get("order") || undefined;
      const accessionNumber = searchParams.get("accessionNumber") || undefined;

      const data = await radiologyService.getStudies({ status, modality, order, accessionNumber });
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async getStudy(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      await dbConnect();
      const { id } = await params;
      const data = await radiologyService.getStudyById(id);
      if (!data) return NextResponse.json({ success: false, message: "Study not found" }, { status: 404 });
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async updateStudy(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      await dbConnect();
      const { id } = await params;
      const body = await request.json();
      const data = await radiologyService.updateStudy(id, body);
      if (!data) return NextResponse.json({ success: false, message: "Study not found" }, { status: 404 });
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async deleteStudy(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
      await dbConnect();
      const { id } = await params;
      await radiologyService.deleteStudy(id);
      return NextResponse.json({ success: true, data: {} });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // --- STATS ---
  async getStats(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await radiologyService.getRadiologyStats();
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
}

const radiologyController = new RadiologyController();
export default radiologyController;
