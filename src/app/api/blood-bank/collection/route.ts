import { NextRequest } from "next/server";
import bloodBankController from "@/controllers/blood-bank.controller";

export async function GET(request: NextRequest) {
  return bloodBankController.getCollections(request);
}

export async function POST(request: NextRequest) {
  return bloodBankController.createCollection(request);
}
