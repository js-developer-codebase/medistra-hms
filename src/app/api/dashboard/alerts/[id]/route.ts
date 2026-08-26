import { NextRequest, NextResponse } from "next/server";
import AlertController from "@/controllers/alert.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  return await AlertController.updateAlert(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  return await AlertController.deleteAlert(id);
}
