import { NextRequest, NextResponse } from "next/server";
import hrService from "@/services/hr.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await hrService.updateDesignationPayBand(id, body);
    return NextResponse.json({
      success: true,
      message: "Designation pay band updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update designation" },
      { status: 400 }
    );
  }
}
