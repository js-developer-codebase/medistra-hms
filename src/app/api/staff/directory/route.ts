import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/doctor.model";
import Staff from "@/models/staff.model";
import User from "@/models/user.model";
import Department from "@/models/department.model";
import Designation from "@/models/designation.model";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    if (!User) {}
    if (!Department) {}
    if (!Designation) {}

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // ALL, DOCTORS, NURSES, LAB, PHARMACY, ADMIN
    const departmentId = searchParams.get("departmentId");
    const search = searchParams.get("search")?.toLowerCase().trim();

    // Fetch doctors
    const doctors = await Doctor.find()
      .populate("userId", "name email phone gender avatar isActive")
      .populate("departmentId", "name code location phoneExtension")
      .lean();

    // Fetch staff
    const staffMembers = await Staff.find()
      .populate("userId", "name email phone gender avatar isActive")
      .populate("departmentId", "name code location phoneExtension")
      .populate("designationId", "name code level")
      .lean();

    const directoryItems: any[] = [];

    // Map doctors into directory
    doctors.forEach((doc: any) => {
      if (!doc.userId) return;
      directoryItems.push({
        id: doc._id.toString(),
        userId: doc.userId._id?.toString(),
        name: doc.userId.name || "Doctor",
        email: doc.userId.email || "",
        phone: doc.phone || doc.userId.phone || "",
        role: "Doctor",
        category: "Doctors",
        department: doc.departmentId?.name || "General Medicine",
        departmentId: doc.departmentId?._id?.toString() || "",
        designation: doc.specialization ? `Specialist (${doc.specialization})` : "Medical Practitioner",
        specialization: doc.specialization || "",
        qualification: doc.qualification || "MBBS / MD",
        experienceYears: doc.experienceYears || 0,
        roomNumber: doc.roomNumber || "OPD",
        status: doc.status || (doc.userId.isActive ? "ACTIVE" : "INACTIVE"),
        type: "DOCTOR",
        avatar: doc.userId.avatar || "",
      });
    });

    // Map staff into directory
    staffMembers.forEach((staff: any) => {
      if (!staff.userId) return;
      let cat = "Other";
      const r = (staff.role || "").toUpperCase();
      if (r.includes("NURSE")) cat = "Nurses";
      else if (r.includes("LAB") || r.includes("TECHNICIAN") || r.includes("RADIOL")) cat = "Diagnostics";
      else if (r.includes("PHARM")) cat = "Pharmacy";
      else if (r.includes("REC") || r.includes("ADMIN") || r.includes("BILL") || r.includes("CASH")) cat = "Administration";

      directoryItems.push({
        id: staff._id.toString(),
        userId: staff.userId._id?.toString(),
        name: staff.userId.name || "Staff Member",
        email: staff.userId.email || "",
        phone: staff.phone || staff.userId.phone || "",
        role: staff.role || "Staff",
        category: cat,
        department: staff.departmentId?.name || "Support",
        departmentId: staff.departmentId?._id?.toString() || "",
        designation: staff.designationId?.name || staff.role || "Hospital Personnel",
        employeeId: staff.employeeId || "",
        qualification: staff.qualification || "",
        shift: staff.shift || "MORNING",
        roomNumber: staff.departmentId?.location || "Main Hospital",
        status: staff.status || (staff.userId.isActive ? "ACTIVE" : "INACTIVE"),
        type: "STAFF",
        avatar: staff.userId.avatar || "",
      });
    });

    let filtered = directoryItems;

    if (category && category !== "ALL") {
      filtered = filtered.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (departmentId && departmentId !== "ALL") {
      filtered = filtered.filter(
        (item) => item.departmentId === departmentId || item.department.toLowerCase() === departmentId.toLowerCase()
      );
    }

    if (search) {
      filtered = filtered.filter((item) => {
        return (
          item.name.toLowerCase().includes(search) ||
          item.email.toLowerCase().includes(search) ||
          item.phone.toLowerCase().includes(search) ||
          item.department.toLowerCase().includes(search) ||
          item.designation.toLowerCase().includes(search) ||
          item.role.toLowerCase().includes(search)
        );
      });
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    console.error("Directory API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load directory" },
      { status: 500 }
    );
  }
}
