import { NextRequest } from "next/server";
import bloodBankController from "@/controllers/blood-bank.controller";

export async function GET(request: NextRequest) {
  return bloodBankController.getReturns(request);
}

export async function POST(request: NextRequest) {
  return bloodBankController.createReturn(request);
}
