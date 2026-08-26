import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import NotificationLog from "@/models/notification-log.model";

export async function GET() {
  try {
    await dbConnect();
    const logs = await NotificationLog.find()
      .populate("templateId", "name")
      .populate("recipient", "name email") // Assuming basic fields for recipient
      .sort({ createdAt: -1 })
      .limit(100); // Pagination could be added later
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const newLog = await NotificationLog.create({
      ...body,
      status: "SENT",
      sentAt: new Date()
    });
    return NextResponse.json({ success: true, data: newLog }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
