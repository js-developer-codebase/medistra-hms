import { NextRequest, NextResponse } from "next/server";
import { ClinicalController } from "@/controllers/clinical.controller";
import dbConnect from "@/lib/dbConnect";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  await dbConnect();
  const params = await context.params;
  return ClinicalController.deleteVitals(req, { params });
}
