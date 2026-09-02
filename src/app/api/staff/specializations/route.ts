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

    // Auto-seed default specializations if empty
    if (specializations.length === 0) {
      const defaultSpecializations = [
        { name: "Cardiology", code: "CARD", description: "Diagnosis and treatment of congenital heart defects, coronary artery disease, and heart failure." },
        { name: "Neurology & Neurosurgery", code: "NEURO", description: "Disorders of the nervous system, brain stroke, epilepsy, and spinal conditions." },
        { name: "Orthopedic Surgery", code: "ORTHO", description: "Musculoskeletal system, joint replacements, trauma care, and bone fractures." },
        { name: "Pediatrics & Child Care", code: "PED", description: "Medical care of infants, children, adolescents, and immunizations." },
        { name: "Obstetrics & Gynecology", code: "OBGYN", description: "Female reproductive health, prenatal care, childbirth, and postnatal wellness." },
        { name: "Dermatology", code: "DERM", description: "Diagnosis and treatment of skin, hair, and nail disorders, cosmetic dermatology." },
        { name: "Ophthalmology", code: "OPHTH", description: "Eye care, cataract surgeries, refractive errors, and vision health." },
        { name: "General & Laparoscopic Surgery", code: "GEN-SURG", description: "Abdominal surgery, hernia repairs, appendix, and minimally invasive procedures." },
        { name: "Otolaryngology (ENT)", code: "ENT", description: "Diseases of the ear, nose, throat, head and neck region." },
        { name: "Pulmonology & Respiratory", code: "PULM", description: "Lungs, asthma, COPD, pneumonia, and sleep disorders." },
        { name: "Medical Oncology", code: "ONCO", description: "Comprehensive cancer management, chemotherapy, and oncology care." },
        { name: "Nephrology & Dialysis", code: "NEPH", description: "Kidney disease, hemodialysis, and hypertension management." },
        { name: "Gastroenterology", code: "GASTRO", description: "Digestive system, liver, endoscopy, and inflammatory bowel diseases." },
        { name: "Emergency Medicine", code: "EMERG", description: "Acute life-threatening conditions, trauma management, and resuscitation." },
      ];
      await Specialization.insertMany(defaultSpecializations);
      specializations = await Specialization.find()
        .populate("departmentId")
        .sort({ createdAt: -1 })
        .lean();
    }

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
