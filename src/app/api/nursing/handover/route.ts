import { NextRequest } from "next/server";
import nursingController from "@/controllers/nursing.controller";

export async function GET(request: NextRequest) {
  return nursingController.getHandovers(request);
}

export async function POST(request: NextRequest) {
  return nursingController.createHandover(request);
}
