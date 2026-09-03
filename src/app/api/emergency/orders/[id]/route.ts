import { NextRequest } from "next/server";
import emergencyController from "@/controllers/emergency.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return emergencyController.updateOrder(request, resolvedParams);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return emergencyController.deleteOrder(request, resolvedParams);
}
