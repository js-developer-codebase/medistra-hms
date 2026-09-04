import { NextRequest } from "next/server";
import procurementController from "@/controllers/procurement.controller";

export async function GET(request: NextRequest) {
  return procurementController.getSuppliers(request);
}

export async function POST(request: NextRequest) {
  return procurementController.createSupplier(request);
}
