import { NextResponse } from "next/server";
import { AdminService } from "@/services/admin.service";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const terminated = await AdminService.terminateSession(id);
    return NextResponse.json({
      success: true,
      message: "Session successfully terminated.",
      data: terminated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
