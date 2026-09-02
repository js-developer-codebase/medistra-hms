import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import DoctorSchedule from "@/models/doctor-schedule.model";
import Doctor from "@/models/doctor.model";
import User from "@/models/user.model";
import Department from "@/models/department.model";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    // Register populated models
    if (!Doctor) {}
    if (!User) {}
    if (!Department) {}

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const dayOfWeek = searchParams.get("dayOfWeek");
    const search = searchParams.get("search")?.toLowerCase().trim();

    const query: any = {};
    if (doctorId && Types.ObjectId.isValid(doctorId)) {
      query.doctorId = doctorId;
    }
    if (dayOfWeek && dayOfWeek !== "ALL") {
      query.dayOfWeek = dayOfWeek;
    }

    let schedules = await DoctorSchedule.find(query)
      .populate({
        path: "doctorId",
        populate: [
          { path: "userId", select: "name email phone avatar" },
          { path: "departmentId", select: "name code location" },
        ],
      })
      .sort({ dayOfWeek: 1, startTime: 1 })
      .lean();

    if (search) {
      schedules = schedules.filter((s: any) => {
        const docName = s.doctorId?.userId?.name?.toLowerCase() || "";
        const spec = s.doctorId?.specialization?.toLowerCase() || "";
        const dept = s.doctorId?.departmentId?.name?.toLowerCase() || "";
        const room = s.roomNumber?.toLowerCase() || "";
        return (
          docName.includes(search) ||
          spec.includes(search) ||
          dept.includes(search) ||
          room.includes(search)
        );
      });
    }

    return NextResponse.json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error: any) {
    console.error("Failed to fetch doctor schedules:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.doctorId || !body.dayOfWeek || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { success: false, message: "Doctor, Day of Week, Start Time, and End Time are required" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(body.doctorId)) {
      return NextResponse.json(
        { success: false, message: "Invalid doctor ID format" },
        { status: 400 }
      );
    }

    const schedule = await DoctorSchedule.create({
      doctorId: body.doctorId,
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      endTime: body.endTime,
      roomNumber: body.roomNumber?.trim() || "OPD-101",
      maxPatients: Number(body.maxPatients) || 20,
      slotDurationMinutes: Number(body.slotDurationMinutes) || 15,
      status: body.status || "ACTIVE",
    });

    const populated = await DoctorSchedule.findById(schedule._id)
      .populate({
        path: "doctorId",
        populate: [
          { path: "userId", select: "name email phone avatar" },
          { path: "departmentId", select: "name code location" },
        ],
      })
      .lean();

    return NextResponse.json(
      { success: true, message: "Schedule created successfully", data: populated },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create schedule" },
      { status: 500 }
    );
  }
}
