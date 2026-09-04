import { NextResponse } from "next/server";
import { NotificationService } from "@/services/notification.service";

export async function GET() {
  try {
    const stats = await NotificationService.getNotificationStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
