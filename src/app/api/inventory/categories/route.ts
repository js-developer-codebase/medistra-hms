import { NextRequest } from "next/server";
import inventoryController from "@/controllers/inventory.controller";

export async function GET(request: NextRequest) {
  return inventoryController.getCategories(request);
}

export async function POST(request: NextRequest) {
  return inventoryController.createCategory(request);
}
