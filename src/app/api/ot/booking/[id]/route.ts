import { NextRequest } from "next/server";
import otController from "@/controllers/ot.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return otController.updateBooking(request, resolvedParams);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return otController.deleteBooking(request, resolvedParams);
}
