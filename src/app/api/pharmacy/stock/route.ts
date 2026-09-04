import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { MedicineService } from "@/services/medicine.service";
import PharmacyController from "@/controllers/pharmacy.controller";

export async function GET(req: Request) {
    await dbConnect();
    try {
        const medicines = await MedicineService.getAll();
        return NextResponse.json({ success: true, data: medicines }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    return PharmacyController.adjustStock(req);
}
