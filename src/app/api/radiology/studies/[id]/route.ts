import { NextRequest } from "next/server";
import radiologyController from "@/controllers/radiology.controller";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return radiologyController.getStudy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return radiologyController.updateStudy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return radiologyController.deleteStudy(request, context);
}
