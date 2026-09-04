import { NextRequest } from "next/server";
import procurementController from "@/controllers/procurement.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await params;
  return procurementController.getRequestById(request, resolved);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await params;
  return procurementController.updateRequest(request, resolved);
}
