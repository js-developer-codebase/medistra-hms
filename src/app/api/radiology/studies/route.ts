import { NextRequest } from "next/server";
import radiologyController from "@/controllers/radiology.controller";

export async function GET(request: NextRequest) {
    return radiologyController.getStudies(request);
}
