import { NextRequest, NextResponse } from "next/server";
import FinanceController from "@/controllers/finance.controller";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await params;
    return FinanceController.updateCreditNoteStatus(request, id);
}
