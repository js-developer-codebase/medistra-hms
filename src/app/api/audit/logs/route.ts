import { NextRequest } from "next/server";
import auditController from "@/controllers/audit.controller";

export async function GET(request: NextRequest) {
    return await auditController.getLogs(request);
}
