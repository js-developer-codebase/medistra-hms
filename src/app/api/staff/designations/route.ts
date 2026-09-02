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

    // If no designations exist yet, seed common hospital designations
    if (designations.length === 0) {
      const defaultDesignations = [
        { name: "Senior Consultant", code: "SR-CONS", department: "Medical", level: "Senior", description: "Senior medical specialist with over 10+ years experience" },
        { name: "Consultant Physician", code: "CONS-PHY", department: "Medical", level: "Senior", description: "Attending consultant in clinical medicine" },
        { name: "Resident Medical Officer", code: "RMO", department: "Medical", level: "Junior", description: "Day-to-day inpatient and emergency coverage" },
        { name: "Head Nurse / Nursing Supervisor", code: "HD-NRS", department: "Nursing", level: "Senior", description: "Oversees ward nursing operations and shift allocations" },
        { name: "Staff Nurse (Grade I)", code: "STF-NRS-1", department: "Nursing", level: "Mid-Level", description: "Senior staff nurse managing patient bedside care" },
        { name: "Staff Nurse (Grade II)", code: "STF-NRS-2", department: "Nursing", level: "Junior", description: "Junior ward and triage staff nurse" },
        { name: "Chief Pharmacist", code: "CHF-PHARM", department: "Pharmacy", level: "Senior", description: "Manages hospital dispensary, stock, and narcotics register" },
        { name: "Staff Pharmacist", code: "STF-PHARM", department: "Pharmacy", level: "Mid-Level", description: "Dispensing medicines and verifying doctor prescriptions" },
        { name: "Senior Lab Technician", code: "SR-LAB-TECH", department: "Laboratory", level: "Senior", description: "Specialized biochemistry and hematology analysis" },
        { name: "Lab Technician", code: "LAB-TECH", department: "Laboratory", level: "Mid-Level", description: "Specimen collection and routine laboratory testing" },
        { name: "Radiology Technician", code: "RAD-TECH", department: "Radiology", level: "Mid-Level", description: "Operates X-Ray, CT, and MRI machinery" },
        { name: "Front Desk Officer", code: "FDO", department: "Administration", level: "Junior", description: "Patient registration, billing inquiry, and appointment desk" },
        { name: "Billing Officer", code: "BILL-OFF", department: "Finance", level: "Mid-Level", description: "Inpatient and outpatient billing and claims processing" },
      ];
      await Designation.insertMany(defaultDesignations);
      designations = await Designation.find().sort({ createdAt: -1 }).lean();
    }

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
