import { NextRequest } from "next/server";
import bloodBankController from "@/controllers/blood-bank.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return bloodBankController.updateRequest(request, resolvedParams);
}
