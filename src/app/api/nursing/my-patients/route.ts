import { NextRequest } from "next/server";
import nursingController from "@/controllers/nursing.controller";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const nurseId = searchParams.get('nurseId');
    if (!nurseId) {
        return Response.json({ success: false, message: 'nurseId is required' }, { status: 400 });
    }
    return nursingController.getMyPatients(request, nurseId);
}
