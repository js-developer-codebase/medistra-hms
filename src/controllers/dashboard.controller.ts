import { NextRequest, NextResponse } from "next/server";
import DashboardService from "@/services/dashboard.service";

class DashboardController {
  async getStats(req: NextRequest) {
    try {
      const data = await DashboardService.getDashboardStats();
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
}

export default new DashboardController();
