import { NextRequest } from "next/server";
import emergencyController from "@/controllers/emergency.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return emergencyController.updateTriage(request, resolvedParams);
}
