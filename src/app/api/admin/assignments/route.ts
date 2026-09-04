import { NextResponse } from "next/server";
import { AdminService } from "@/services/admin.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get("roleId") || "ALL";
    const search = searchParams.get("search") || "";

    const data = await AdminService.getUserAssignments({ roleId, search });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userIds, roleId, userId } = await req.json();

    if (!roleId) {
      return NextResponse.json(
        { success: false, message: "Target roleId is required." },
        { status: 400 }
      );
    }

    if (userId) {
      const user = await AdminService.updateUserRole(userId, roleId);
      return NextResponse.json({
        success: true,
        message: "User role updated successfully.",
        data: user,
      });
    }

    if (Array.isArray(userIds) && userIds.length > 0) {
      const result = await AdminService.bulkAssignRoles(userIds, roleId);
      return NextResponse.json({
        success: true,
        message: `Successfully updated roles for ${userIds.length} users.`,
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, message: "Either userId or userIds array must be provided." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
