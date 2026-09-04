import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PharmacyController from "@/controllers/pharmacy.controller";

export async function GET(req: Request) {
    await dbConnect();
    return PharmacyController.getStats(req);
}
