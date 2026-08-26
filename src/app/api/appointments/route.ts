import { NextRequest } from "next/server";
import { AppointmentController } from "@/controllers/appointment.controller";

export async function GET(req: NextRequest) {
    return AppointmentController.getAll(req);
}

export async function POST(req: NextRequest) {
    return AppointmentController.create(req);
}
