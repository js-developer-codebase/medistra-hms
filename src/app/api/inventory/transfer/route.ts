import { NextRequest } from "next/server";
import inventoryController from "@/controllers/inventory.controller";

export async function GET(request: NextRequest) {
  return inventoryController.getTransfers(request);
}

export async function POST(request: NextRequest) {
  return inventoryController.createTransfer(request);
}
