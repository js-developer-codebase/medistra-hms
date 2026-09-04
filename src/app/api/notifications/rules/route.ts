import { NextResponse } from "next/server";
import { NotificationService } from "@/services/notification.service";

export async function GET() {
  try {
    const rules = await NotificationService.getRules();
    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newRule = await NotificationService.createRule(body);
    return NextResponse.json({ success: true, data: newRule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
