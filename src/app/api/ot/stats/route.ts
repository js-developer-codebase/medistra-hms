import { NextRequest } from "next/server";
import otController from "@/controllers/ot.controller";

export async function GET(request: NextRequest) {
  return otController.getStats(request);
}
