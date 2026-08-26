import { NextRequest } from "next/server";
import prescriptionController from "@/controllers/prescription.controller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return prescriptionController.getPrescriptionById(id);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return prescriptionController.updatePrescription(req, id);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return prescriptionController.deletePrescription(id);
}
