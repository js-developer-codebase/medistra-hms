import { NextRequest } from "next/server";
import inventoryController from "@/controllers/inventory.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await params;
  return inventoryController.updateItem(request, resolved);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await params;
  return inventoryController.deleteItem(request, resolved);
}
