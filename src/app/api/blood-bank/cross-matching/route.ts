import { NextRequest } from "next/server";
import bloodBankController from "@/controllers/blood-bank.controller";

export async function GET(request: NextRequest) {
  return bloodBankController.getCrossmatches(request);
}

export async function POST(request: NextRequest) {
  return bloodBankController.createCrossmatch(request);
}
