import { NextRequest } from "next/server";
import radiologyController from "@/controllers/radiology.controller";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return radiologyController.getProcedure(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return radiologyController.updateProcedure(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return radiologyController.deleteProcedure(request, context);
}
