import { NextResponse } from "next/server";
import { NotificationService } from "@/services/notification.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "ALL";
    const category = searchParams.get("category") || "ALL";

    const templates = await NotificationService.getTemplates({ type, category });
    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newTemplate = await NotificationService.createTemplate(body);
    return NextResponse.json({ success: true, data: newTemplate }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
