import { NextRequest, NextResponse } from "next/server";
import AlertController from "@/controllers/alert.controller";

export async function POST(request: NextRequest): Promise<NextResponse> {
  return await AlertController.createAlert(request);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return await AlertController.getAlerts(request);
}
