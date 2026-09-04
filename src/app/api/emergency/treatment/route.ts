import { NextRequest } from "next/server";
import emergencyController from "@/controllers/emergency.controller";

export async function GET(request: NextRequest) {
  return emergencyController.getTreatments(request);
}

export async function POST(request: NextRequest) {
  return emergencyController.createTreatment(request);
}
