import { NextRequest, NextResponse } from "next/server";
import hrService from "@/services/hr.service";
import Designation from "@/models/designation.model";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
  try {
    const designations = await hrService.getHRDesignations();
    return NextResponse.json({ success: true, count: designations.length, data: designations });
  } catch (error: any) {
    console.error("Failed to fetch HR designations:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch HR designations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const newDesig = await Designation.create({
      name: body.name?.trim(),
      code: body.code?.trim().toUpperCase(),
      department: body.department || "General",
      level: body.level || "Mid-Level",
      description: body.description,
      salaryMin: Number(body.salaryMin) || 25000,
      salaryMax: Number(body.salaryMax) || 60000,
      requirements: body.requirements || "Standard Healthcare Credentials",
      isActive: true,
    });
    return NextResponse.json(
      { success: true, message: "Designation created successfully", data: newDesig },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create designation" },
      { status: 400 }
    );
  }
}
