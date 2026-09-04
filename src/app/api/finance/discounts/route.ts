import { NextRequest, NextResponse } from "next/server";
import FinanceController from "@/controllers/finance.controller";

export async function GET(request: NextRequest): Promise<NextResponse> {
    return FinanceController.getDiscounts(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    return FinanceController.createDiscount(request);
}
