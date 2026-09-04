import { NextRequest } from "next/server";
import procurementController from "@/controllers/procurement.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await params;
  return procurementController.getPurchaseOrderById(request, resolved);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await params;
  return procurementController.updatePurchaseOrder(request, resolved);
}
