import { NextRequest, NextResponse } from "next/server";
import emergencyController from "@/controllers/emergency.controller";

export async function POST(request: NextRequest) {
  return emergencyController.createCasualty(request);
}

export async function GET(request: NextRequest) {
  return emergencyController.getCasualties(request);
}
