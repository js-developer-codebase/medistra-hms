import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PharmacyController from "@/controllers/pharmacy.controller";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const resolvedParams = await params;
    return PharmacyController.updateCategory(req, { params: resolvedParams });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const resolvedParams = await params;
    return PharmacyController.deleteCategory(req, { params: resolvedParams });
}
