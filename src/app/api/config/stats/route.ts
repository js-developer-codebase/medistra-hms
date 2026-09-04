import { NextRequest } from "next/server";
import configController from "@/controllers/config.controller";

export async function GET(request: NextRequest) {
    return await configController.getConfigStats(request);
}
