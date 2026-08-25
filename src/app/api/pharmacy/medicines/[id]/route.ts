import { NextResponse } from "next/server";
import { MedicineController } from "@/controllers/medicine.controller";
import dbConnect from "@/lib/dbConnect";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    return MedicineController.getById(req, { params: { id } });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    return MedicineController.update(req, { params: { id } });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    return MedicineController.delete(req, { params: { id } });
}
