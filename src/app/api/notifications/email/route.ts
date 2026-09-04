import { NextResponse } from "next/server";
import { NotificationService } from "@/services/notification.service";

export async function GET() {
  try {
    const stats = await NotificationService.getEmailStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.email || !body.subject || !body.content) {
      return NextResponse.json(
        { success: false, message: "Email, subject, and content are required" },
        { status: 400 }
      );
    }

    const log = await NotificationService.sendEmail(body);
    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
