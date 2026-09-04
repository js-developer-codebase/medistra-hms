import { NextRequest, NextResponse } from "next/server";
import InsuranceController from "@/controllers/insurance.controller";

export async function GET(request: NextRequest): Promise<NextResponse> {
  return InsuranceController.getPolicies(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return InsuranceController.createPolicy(request);
}
