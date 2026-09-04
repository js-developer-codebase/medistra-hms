import { NextRequest } from "next/server";
import emergencyController from "@/controllers/emergency.controller";

export async function GET(request: NextRequest) {
  return emergencyController.getStats(request);
}
