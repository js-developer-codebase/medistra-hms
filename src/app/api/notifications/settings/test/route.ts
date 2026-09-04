import { NextResponse } from "next/server";
import { NotificationService } from "@/services/notification.service";

export async function POST(req: Request) {
  try {
    const { type } = await req.json();
    const result = await NotificationService.testGateway(type || "SMS");
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
