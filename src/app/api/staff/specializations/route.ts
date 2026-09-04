import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Specialization from "@/models/specialization.model";
import Department from "@/models/department.model";
import Doctor from "@/models/doctor.model";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    if (!Department) {}
    if (!Doctor) {}

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let specializations = await Specialization.find()
      .populate("departmentId")
      .sort({ createdAt: -1 })
      .lean();

    // Attach doctor counts for each specialization
    const allDoctors = await Doctor.find().lean();
    let enriched = specializations.map((spec: any) => {
      const docCount = allDoctors.filter((d: any) =>
        d.specialization &&
        d.specialization.toLowerCase().trim() === spec.name.toLowerCase().trim()
      ).length;
      return {
        ...spec,
        doctorCount: docCount,
      };
    });

    if (departmentId && Types.ObjectId.isValid(departmentId)) {
      enriched = enriched.filter((s: any) =>
        s.departmentId && (s.departmentId._id?.toString() === departmentId || s.departmentId.toString() === departmentId)
      );
    }

    if (search) {
      enriched = enriched.filter((s: any) =>
        s.name?.toLowerCase().includes(search) ||
        s.code?.toLowerCase().includes(search) ||
        s.departmentId?.name?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch specializations" },
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
        { success: false, message: "Specialization name and code are required" },
        { status: 400 }
      );
    }

    const code = body.code.trim().toUpperCase();
    const existing = await Specialization.findOne({ code });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Specialization code '${code}' already exists` },
        { status: 409 }
      );
    }

    const specialization = await Specialization.create({
      name: body.name.trim(),
      code,
      departmentId: body.departmentId && Types.ObjectId.isValid(body.departmentId) ? body.departmentId : undefined,
      description: body.description?.trim() || "",
      isActive: body.isActive ?? true,
    });

    const populated = await Specialization.findById(specialization._id)
      .populate("departmentId")
      .lean();

    return NextResponse.json(
      { success: true, message: "Specialization created successfully", data: populated },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create specialization" },
      { status: 500 }
    );
  }
}
