import { NextRequest, NextResponse } from "next/server";
import reportsController from "@/controllers/reports.controller";

export async function GET(): Promise<NextResponse> {
  return reportsController.getBeds();
}
