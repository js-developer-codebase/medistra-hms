import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import nursingService from "@/services/nursing.service";

export class NursingController {
  // 1. My Inpatients
  async getMyPatients(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await nursingService.getMyPatients();
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // 2. Nursing Stats
  async getNursingStats(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await nursingService.getNursingStats();
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // 3. Care Plans
  async getCarePlans(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const patientId = searchParams.get("patientId") || undefined;
      const data = await nursingService.getCarePlans(patientId);
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

  async updateCarePlan(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await nursingService.updateCarePlan(id, body);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async deleteCarePlan(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await nursingService.deleteCarePlan(id);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // 4. Tasks
  async getTasks(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const patientId = searchParams.get("patientId") || undefined;
      const data = await nursingService.getTasks(patientId);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async createTask(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await nursingService.createTask(body);
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async updateTask(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await nursingService.updateTask(id, body);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async deleteTask(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await nursingService.deleteTask(id);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // 5. Intake Output
  async getIntakeOutputs(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const patientId = searchParams.get("patientId") || undefined;
      const data = await nursingService.getIntakeOutputs(patientId);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async createIntakeOutput(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await nursingService.createIntakeOutput(body);
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async deleteIntakeOutput(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await nursingService.deleteIntakeOutput(id);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // 6. Medications (eMAR)
  async getMedications(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const patientId = searchParams.get("patientId") || undefined;
      const data = await nursingService.getMedications(patientId);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async createMedication(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await nursingService.createMedication(body);
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async updateMedication(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await nursingService.updateMedication(id, body);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async deleteMedication(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await nursingService.deleteMedication(id);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // 7. Handover (SBAR)
  async getHandovers(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const wardId = searchParams.get("wardId") || undefined;
      const data = await nursingService.getHandovers(wardId);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async createHandover(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await nursingService.createHandover(body);
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async updateHandover(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await nursingService.updateHandover(id, body);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async deleteHandover(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await nursingService.deleteHandover(id);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  // 8. Shifts
  async getShifts(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const wardId = searchParams.get("wardId") || undefined;
      const data = await nursingService.getShifts(wardId);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async createShift(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await nursingService.createShift(body);
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async updateShift(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const body = await request.json();
      const data = await nursingService.updateShift(id, body);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  async deleteShift(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await nursingService.deleteShift(id);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
}

export default new NursingController();
