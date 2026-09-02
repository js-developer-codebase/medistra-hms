import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Staff from "@/models/staff.model";
import User from "@/models/user.model";
import Department from "@/models/department.model";
import Designation from "@/models/designation.model";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await dbConnect();
    if (!Department) {}
    if (!Designation) {}
    if (!User) {}

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid staff ID" }, { status: 400 });
    }

    const staff = await Staff.findById(id)
      .populate("userId", "-password")
      .populate("departmentId")
      .populate("designationId")
      .lean();

    if (!staff) {
      return NextResponse.json({ success: false, message: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch staff" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await dbConnect();
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid staff ID" }, { status: 400 });
    }

    const body = await request.json();

    const updateData: any = {};
    if (body.employeeId) updateData.employeeId = body.employeeId.trim().toUpperCase();
    if (body.departmentId) updateData.departmentId = body.departmentId;
    if (body.designationId) updateData.designationId = body.designationId;
    if (body.role) updateData.role = body.role;
    if (body.qualification !== undefined) updateData.qualification = body.qualification.trim();
    if (body.shift) updateData.shift = body.shift;
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.emergencyContact !== undefined) updateData.emergencyContact = body.emergencyContact.trim();
    if (body.status) updateData.status = body.status;

    const staff = await Staff.findByIdAndUpdate(id, updateData, { new: true })
      .populate("userId", "-password")
      .populate("departmentId")
      .populate("designationId")
      .lean();

    if (!staff) {
      return NextResponse.json({ success: false, message: "Staff not found" }, { status: 404 });
    }

    // Also update linked user profile if requested
    if (staff.userId) {
      const userUpdate: any = {};
      if (body.name) userUpdate.name = body.name.trim();
      if (body.phone) userUpdate.phone = body.phone.trim();
      if (typeof body.isActive === "boolean") userUpdate.isActive = body.isActive;
      if (Object.keys(userUpdate).length > 0) {
        const uId = (staff.userId as any)._id || staff.userId;
        await User.findByIdAndUpdate(uId, userUpdate);
      }
    }

    return NextResponse.json({ success: true, message: "Staff updated successfully", data: staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Failed to update staff" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await dbConnect();
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid staff ID" }, { status: 400 });
    }

    const staff = await Staff.findByIdAndDelete(id).lean();
    if (!staff) {
      return NextResponse.json({ success: false, message: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Staff deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete staff" }, { status: 500 });
  }
}
