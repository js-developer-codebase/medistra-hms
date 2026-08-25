import { NextRequest } from "next/server";
import { AppointmentController } from "@/controllers/appointment.controller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return AppointmentController.getById(req, { params: { id } });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return AppointmentController.update(req, { params: { id } });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return AppointmentController.delete(req, { params: { id } });
}
