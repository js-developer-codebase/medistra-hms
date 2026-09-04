import { NextRequest, NextResponse } from "next/server";
import FinanceController from "@/controllers/finance.controller";

export async function GET(request: NextRequest): Promise<NextResponse> {
    return FinanceController.getReports(request);
}
