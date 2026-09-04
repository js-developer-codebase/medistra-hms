import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PharmacyController from "@/controllers/pharmacy.controller";

export async function GET(req: Request) {
    await dbConnect();
    return PharmacyController.getCategories(req);
}

export async function POST(req: Request) {
    await dbConnect();
    return PharmacyController.createCategory(req);
}
