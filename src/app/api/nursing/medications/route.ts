import { NextRequest } from "next/server";
import nursingController from "@/controllers/nursing.controller";

export async function GET(request: NextRequest) {
  return nursingController.getMedications(request);
}

export async function POST(request: NextRequest) {
  return nursingController.createMedication(request);
}
