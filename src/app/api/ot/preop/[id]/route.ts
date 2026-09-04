import { NextRequest } from "next/server";
import otController from "@/controllers/ot.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return otController.updatePreOpChecklist(request, resolvedParams);
}
