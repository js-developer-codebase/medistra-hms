import { NextRequest, NextResponse } from "next/server";
import reportsController from "@/controllers/reports.controller";

export async function GET(request: NextRequest): Promise<NextResponse> {
  return reportsController.getDischarges(request);
}
