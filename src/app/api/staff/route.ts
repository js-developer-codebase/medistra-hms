import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Staff from "@/models/staff.model";
import User from "@/models/user.model";
import Role from "@/models/role.model";
import Department from "@/models/department.model";
import Designation from "@/models/designation.model";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    // Ensure dependent models are registered
    if (!Department) {}
    if (!Designation) {}
    if (!User) {}

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const role = searchParams.get("role");
    const search = searchParams.get("search")?.toLowerCase().trim();

    const query: any = {};
    if (departmentId && Types.ObjectId.isValid(departmentId)) {
      query.departmentId = departmentId;
    }
    if (role && role !== "ALL") {
      query.role = role;
    }

    let staffMembers = await Staff.find(query)
      .populate("userId", "-password")
      .populate("departmentId")
      .populate("designationId")
      .sort({ createdAt: -1 })
      .lean();

    if (search) {
      staffMembers = staffMembers.filter((s: any) => {
        const name = s.userId?.name?.toLowerCase() || "";
        const email = s.userId?.email?.toLowerCase() || "";
        const empId = s.employeeId?.toLowerCase() || "";
        const sRole = s.role?.toLowerCase() || "";
        const dept = s.departmentId?.name?.toLowerCase() || "";
        const desig = s.designationId?.name?.toLowerCase() || "";
        return (
          name.includes(search) ||
          email.includes(search) ||
          empId.includes(search) ||
          sRole.includes(search) ||
          dept.includes(search) ||
          desig.includes(search)
        );
      });
    }

    return NextResponse.json({
      success: true,
      count: staffMembers.length,
      data: staffMembers,
    });
  } catch (error: any) {
    console.error("Failed to fetch staff members:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const body = await request.json();

    let userId = body.userId;

    // If inline user details provided, create user or link existing user
    if (!userId && body.name && body.email) {
      const email = body.email.toLowerCase().trim();
      let existingUser = await User.findOne({ email });
      if (!existingUser) {
        const roleName = body.role || "NURSE";
        let userRole = await Role.findOne({ role: roleName });
        if (!userRole) {
          userRole = await Role.create({ role: roleName, access: [] });
        }
        const hashedPassword = await bcrypt.hash(body.password || "staff123", 10);
        existingUser = await User.create({
          name: body.name.trim(),
          email,
          password: hashedPassword,
          gender: body.gender || "OTHER",
          phone: body.phone,
          role: userRole._id,
          isActive: true,
        });
      }
      userId = existingUser._id.toString();
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Staff user information is required" },
        { status: 400 }
      );
    }

    // Check if staff profile already exists for this user
    const existingStaff = await Staff.findOne({ userId });
    if (existingStaff) {
      return NextResponse.json(
        { success: false, message: "A staff profile already exists for this user" },
        { status: 409 }
      );
    }

    const employeeId =
      body.employeeId?.trim().toUpperCase() ||
      `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newStaff = await Staff.create({
      userId,
      employeeId,
      departmentId: body.departmentId && Types.ObjectId.isValid(body.departmentId) ? body.departmentId : undefined,
      designationId: body.designationId && Types.ObjectId.isValid(body.designationId) ? body.designationId : undefined,
      role: body.role || "NURSE",
      qualification: body.qualification?.trim() || "",
      joiningDate: body.joiningDate ? new Date(body.joiningDate) : new Date(),
      shift: body.shift || "MORNING",
      phone: body.phone?.trim() || "",
      emergencyContact: body.emergencyContact?.trim() || "",
      status: body.status || "ACTIVE",
    });

    const populatedStaff = await Staff.findById(newStaff._id)
      .populate("userId", "-password")
      .populate("departmentId")
      .populate("designationId")
      .lean();

    return NextResponse.json(
      { success: true, message: "Staff created successfully", data: populatedStaff },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create staff:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create staff" },
      { status: 500 }
    );
  }
}
