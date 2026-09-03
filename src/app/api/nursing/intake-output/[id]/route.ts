import { NextRequest } from "next/server";
import nursingController from "@/controllers/nursing.controller";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return nursingController.deleteIntakeOutput(request, id);
}
