import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Ward from "@/models/ward.model";
import Room from "@/models/room.model";
import Bed from "@/models/bed.model";
import Admission from "@/models/admission.model";
import "@/models/patient.model";
import "@/models/user.model";

export async function GET(): Promise<NextResponse> {
  try {
    await dbConnect();

    // 1. Basic counts
    const [totalWards, totalRooms, beds, wards, activeAdmissions] = await Promise.all([
      Ward.countDocuments({ isActive: true }),
      Room.countDocuments({ isActive: true }),
      Bed.find().populate({
        path: "roomId",
        populate: { path: "wardId" }
      }).lean(),
      Ward.find({ isActive: true }).lean(),
      Admission.find({ status: "ACTIVE" })
        .populate("patientId", "name uhid age gender contact")
        .populate("doctorId", "name email")
        .populate({
          path: "bedId",
          populate: { path: "roomId", populate: { path: "wardId" } }
        })
        .lean()
    ]);

    const totalBeds = beds.length;
    let availableBeds = 0;
    let occupiedBeds = 0;
    let maintenanceBeds = 0;
    let reservedBeds = 0;
    let blockedBeds = 0;

    // Ward breakdown accumulator
    const wardMap: Record<string, {
      wardId: string;
      wardName: string;
      wardCode: string;
      wardType: string;
      floor: number;
      totalRooms: Set<string>;
      totalBeds: number;
      occupiedBeds: number;
      availableBeds: number;
      maintenanceBeds: number;
    }> = {};

    wards.forEach((w: any) => {
      wardMap[w._id.toString()] = {
        wardId: w._id.toString(),
        wardName: w.wardName,
        wardCode: w.wardCode,
        wardType: w.wardType,
        floor: w.floor,
        totalRooms: new Set(),
        totalBeds: 0,
        occupiedBeds: 0,
        availableBeds: 0,
        maintenanceBeds: 0
      };
    });

    beds.forEach((b: any) => {
      const status = b.status || "AVAILABLE";
      if (status === "AVAILABLE") availableBeds++;
      else if (status === "OCCUPIED") occupiedBeds++;
      else if (status === "MAINTENANCE") maintenanceBeds++;
      else if (status === "RESERVED") reservedBeds++;
      else if (status === "BLOCKED") blockedBeds++;

      const room = b.roomId as any;
      if (room) {
        const ward = room.wardId as any;
        const wardId = ward?._id ? ward._id.toString() : (ward ? ward.toString() : null);
        if (wardId && wardMap[wardId]) {
          wardMap[wardId].totalRooms.add(room._id.toString());
          wardMap[wardId].totalBeds++;
          if (status === "OCCUPIED") wardMap[wardId].occupiedBeds++;
          else if (status === "AVAILABLE") wardMap[wardId].availableBeds++;
          else if (status === "MAINTENANCE") wardMap[wardId].maintenanceBeds++;
        }
      }
    });

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const wardStats = Object.values(wardMap).map((w) => ({
      ...w,
      totalRooms: w.totalRooms.size,
      occupancyRate: w.totalBeds > 0 ? Math.round((w.occupiedBeds / w.totalBeds) * 100) : 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalWards,
        totalRooms,
        totalBeds,
        availableBeds,
        occupiedBeds,
        maintenanceBeds,
        reservedBeds,
        blockedBeds,
        occupancyRate,
        wardStats,
        activeInpatientsCount: activeAdmissions.length,
        activeAdmissions: activeAdmissions.slice(0, 10)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch ward statistics" },
      { status: 500 }
    );
  }
}
