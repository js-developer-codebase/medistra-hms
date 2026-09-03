import { NextRequest } from "next/server";
import radiologyController from "@/controllers/radiology.controller";

export async function GET(request: NextRequest) {
  return radiologyController.getProcedures(request);
}

export async function POST(request: NextRequest) {
  return radiologyController.createProcedure(request);
}
