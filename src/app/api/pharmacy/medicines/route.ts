import { NextResponse } from "next/server";
import { MedicineController } from "@/controllers/medicine.controller";
import dbConnect from "@/lib/dbConnect";

export async function GET(req: Request) {
    await dbConnect();
    return MedicineController.getAll(req);
}

export async function POST(req: Request) {
    await dbConnect();
    return MedicineController.create(req);
}
