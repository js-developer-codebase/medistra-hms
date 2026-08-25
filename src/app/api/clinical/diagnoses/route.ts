import { NextRequest } from "next/server";
import { ClinicalController } from "@/controllers/clinical.controller";
import dbConnect from "@/lib/dbConnect";

export async function GET(req: NextRequest) {
  await dbConnect();
  return ClinicalController.getDiagnoses(req);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  return ClinicalController.createDiagnosis(req);
}
