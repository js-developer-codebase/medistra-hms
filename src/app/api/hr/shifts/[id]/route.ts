import { NextRequest, NextResponse } from "next/server";
import hrService from "@/services/hr.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await hrService.updateShift(id, body);
    return NextResponse.json({
      success: true,
      message: "Shift updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update shift" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await hrService.deleteShift(id);
    return NextResponse.json({
      success: true,
      message: "Shift deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete shift" },
      { status: 400 }
    );
  }
}
