import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { SurgerySchedule } from "@/models/surgery-schedule.model";
import { PreOpChecklist } from "@/models/preop-checklist.model";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const schedules = await SurgerySchedule.find()
      .select("surgeryCode patientName uhid surgeryName otRoom surgeon anesthesiologist anesthesiaType asaGrade preOpCleared status")
      .sort({ date: -1 });
    return NextResponse.json({ success: true, data: schedules });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    if (data.surgeryScheduleId) {
      await SurgerySchedule.findByIdAndUpdate(data.surgeryScheduleId, {
        anesthesiaType: data.anesthesiaType,
        asaGrade: data.asaGrade,
        anesthesiologist: data.anesthesiologist
      });
    }
    return NextResponse.json({ success: true, message: "Anesthesia evaluation saved." });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
