import { NextRequest, NextResponse } from "next/server";
import AppointmentController from "@/controllers/appointment.controller";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        return AppointmentController.createAppointment(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to create appointment"
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        return AppointmentController.getAppointments(request);
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message || "Failed to fetch appointments"
        }, { status: 500 });
    }
}
