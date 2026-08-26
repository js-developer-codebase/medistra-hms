import { NextRequest } from "next/server";
import otController from "@/controllers/ot.controller";

export async function POST(request: NextRequest) {
  return otController.createSchedule(request);
}

export async function GET(request: NextRequest) {
  return otController.getSchedules(request);
}
