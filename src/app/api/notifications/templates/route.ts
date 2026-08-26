import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import NotificationTemplate from "@/models/notification-template.model";

export async function GET() {
  try {
    await dbConnect();
    const templates = await NotificationTemplate.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const newTemplate = await NotificationTemplate.create(body);
    return NextResponse.json({ success: true, data: newTemplate }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
