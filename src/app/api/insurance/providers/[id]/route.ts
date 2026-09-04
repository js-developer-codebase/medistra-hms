import { NextRequest, NextResponse } from "next/server";
import InsuranceController from "@/controllers/insurance.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  return InsuranceController.getProviderById(id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  return InsuranceController.updateProvider(request, id);
}
