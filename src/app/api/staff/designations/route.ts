import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Designation from "@/models/designation.model";
import Staff from "@/models/staff.model";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();

    let designations = await Designation.find().sort({ createdAt: -1 }).lean();

    // Attach staff counts
    const staffCountMap = new Map<string, number>();
    try {
      const counts = await Staff.aggregate([
        { $match: { designationId: { $exists: true, $ne: null } } },
        { $group: { _id: "$designationId", count: { $sum: 1 } } }
      ]);
      counts.forEach((c: any) => staffCountMap.set(c._id.toString(), c.count));
    } catch (e) {}

    let enriched = designations.map((d: any) => ({
      ...d,
      staffCount: staffCountMap.get(d._id.toString()) || 0,
    }));

    if (search) {
      enriched = enriched.filter((d: any) =>
        d.name?.toLowerCase().includes(search) ||
        d.code?.toLowerCase().includes(search) ||
        d.department?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch designations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.name || !body.code) {
      return NextResponse.json(
        { success: false, message: "Designation name and code are required" },
        { status: 400 }
      );
    }

    const code = body.code.trim().toUpperCase();
    const existing = await Designation.findOne({ code });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Designation code '${code}' already exists` },
        { status: 409 }
      );
    }

    const designation = await Designation.create({
      name: body.name.trim(),
      code,
      department: body.department?.trim() || "General",
      level: body.level?.trim() || "Mid-Level",
      description: body.description?.trim() || "",
      isActive: body.isActive ?? true,
    });

    return NextResponse.json(
      { success: true, message: "Designation created successfully", data: designation },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create designation" },
      { status: 500 }
    );
  }
}
