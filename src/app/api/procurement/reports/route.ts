import { NextRequest } from "next/server";
import procurementController from "@/controllers/procurement.controller";

export async function GET(request: NextRequest) {
  return procurementController.getReports(request);
}
