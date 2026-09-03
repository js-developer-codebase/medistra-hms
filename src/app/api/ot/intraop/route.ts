import { NextRequest } from "next/server";
import otController from "@/controllers/ot.controller";

export async function GET(request: NextRequest) {
  return otController.getIntraOpRecords(request);
}

export async function POST(request: NextRequest) {
  return otController.createIntraOpRecord(request);
}
