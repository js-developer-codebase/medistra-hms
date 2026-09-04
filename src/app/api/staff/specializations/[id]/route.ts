import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Specialization from "@/models/specialization.model";
import Department from "@/models/department.model";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await dbConnect();
    if (!Department) {}
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid specialization ID" }, { status: 400 });
    }

    const specialization = await Specialization.findById(id)
      .populate("departmentId")
      .lean();

    if (!specialization) {
      return NextResponse.json({ success: false, message: "Specialization not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: specialization });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch specialization" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await dbConnect();
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid specialization ID" }, { status: 400 });
    }

    const body = await request.json();
    const updateData: any = {};
    if (body.name) updateData.name = body.name.trim();
    if (body.code) {
      const code = body.code.trim().toUpperCase();
      const existing = await Specialization.findOne({ code, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ success: false, message: `Code '${code}' is already used` }, { status: 409 });
      }
      updateData.code = code;
    }
    if (body.departmentId) updateData.departmentId = body.departmentId;
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (typeof body.isActive === "boolean") updateData.isActive = body.isActive;

    const specialization = await Specialization.findByIdAndUpdate(id, updateData, { new: true })
      .populate("departmentId")
      .lean();

    if (!specialization) {
      return NextResponse.json({ success: false, message: "Specialization not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Specialization updated successfully", data: specialization });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Failed to update specialization" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    await dbConnect();
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid specialization ID" }, { status: 400 });
    }

    const specialization = await Specialization.findByIdAndDelete(id).lean();
    if (!specialization) {
      return NextResponse.json({ success: false, message: "Specialization not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Specialization deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete specialization" }, { status: 500 });
  }
}
