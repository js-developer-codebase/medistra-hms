import { NextRequest } from "next/server";
import emergencyController from "@/controllers/emergency.controller";

export async function POST(request: NextRequest) {
  return emergencyController.processAdmission(request);
}
