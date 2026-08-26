import { NextRequest, NextResponse } from "next/server";
import BloodBankController from "@/controllers/blood-bank.controller";

export async function POST(request: NextRequest): Promise<NextResponse> {
    return BloodBankController.createInventory(request);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    return BloodBankController.getInventory(request);
}
