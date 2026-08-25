import { NextRequest } from "next/server";
import prescriptionController from "@/controllers/prescription.controller";

export async function GET(req: NextRequest) {
    return prescriptionController.getPrescriptions(req);
}

export async function POST(req: NextRequest) {
    return prescriptionController.createPrescription(req);
}
