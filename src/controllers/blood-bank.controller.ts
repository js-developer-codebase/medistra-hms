import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import bloodBankService from "@/services/blood-bank.service";

export class BloodBankController {
  // Stats
  async getStats(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const stats = await bloodBankService.getBloodBankStats();
      return NextResponse.json({ success: true, data: stats });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 1. Donors
  async createDonor(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const donor = await bloodBankService.createDonor(data);
      return NextResponse.json({ success: true, data: donor }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getDonors(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const bloodGroup = searchParams.get("bloodGroup");
      const eligibilityStatus = searchParams.get("eligibilityStatus");
      const filter: any = {};
      if (bloodGroup && bloodGroup !== "ALL") filter.bloodGroup = bloodGroup;
      if (eligibilityStatus && eligibilityStatus !== "ALL") filter.eligibilityStatus = eligibilityStatus;

      const donors = await bloodBankService.getDonors(filter);
      return NextResponse.json({ success: true, data: donors });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateDonor(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const donor = await bloodBankService.updateDonor(params.id, data);
      return NextResponse.json({ success: true, data: donor });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async deleteDonor(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      await bloodBankService.deleteDonor(params.id);
      return NextResponse.json({ success: true, message: "Donor deleted" });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 2. Collection
  async createCollection(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const collection = await bloodBankService.createCollection(data);
      return NextResponse.json({ success: true, data: collection }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getCollections(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const collections = await bloodBankService.getCollections();
      return NextResponse.json({ success: true, data: collections });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 3. Inventory
  async createInventory(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const inv = await bloodBankService.createInventory(data);
      return NextResponse.json({ success: true, data: inv }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getInventory(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const bloodGroup = searchParams.get("bloodGroup");
      const status = searchParams.get("status");
      const componentType = searchParams.get("componentType");
      const filter: any = {};
      if (bloodGroup && bloodGroup !== "ALL") filter.bloodGroup = bloodGroup;
      if (status && status !== "ALL") filter.status = status;
      if (componentType && componentType !== "ALL") filter.componentType = componentType;

      const invs = await bloodBankService.getInventory(filter);
      return NextResponse.json({ success: true, data: invs });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateInventory(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const inv = await bloodBankService.updateInventory(params.id, data);
      return NextResponse.json({ success: true, data: inv });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async deleteInventory(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      await bloodBankService.deleteInventory(params.id);
      return NextResponse.json({ success: true, message: "Inventory unit deleted" });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 4. Testing (TTI)
  async createTest(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const test = await bloodBankService.createTest(data);
      return NextResponse.json({ success: true, data: test }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getTests(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const tests = await bloodBankService.getTests();
      return NextResponse.json({ success: true, data: tests });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 5. Crossmatch
  async createCrossmatch(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const xm = await bloodBankService.createCrossmatch(data);
      return NextResponse.json({ success: true, data: xm }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getCrossmatches(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const xms = await bloodBankService.getCrossmatches();
      return NextResponse.json({ success: true, data: xms });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 6. Requests
  async createRequest(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const req = await bloodBankService.createRequest(data);
      return NextResponse.json({ success: true, data: req }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getRequests(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const requests = await bloodBankService.getRequests();
      return NextResponse.json({ success: true, data: requests });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateRequest(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const req = await bloodBankService.updateRequest(params.id, data);
      return NextResponse.json({ success: true, data: req });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 7. Issue
  async createIssue(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const issue = await bloodBankService.createIssue(data);
      return NextResponse.json({ success: true, data: issue }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getIssues(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const issues = await bloodBankService.getIssues();
      return NextResponse.json({ success: true, data: issues });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 8. Return
  async createReturn(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const ret = await bloodBankService.createReturn(data);
      return NextResponse.json({ success: true, data: ret }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getReturns(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const returns = await bloodBankService.getReturns();
      return NextResponse.json({ success: true, data: returns });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }
}

export const bloodBankController = new BloodBankController();
export default bloodBankController;
