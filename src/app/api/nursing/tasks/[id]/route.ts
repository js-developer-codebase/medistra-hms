import { NextRequest } from "next/server";
import nursingController from "@/controllers/nursing.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return nursingController.updateTask(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return nursingController.deleteTask(request, id);
}
