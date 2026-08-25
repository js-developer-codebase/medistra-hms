import { NextRequest } from "next/server";
import configController from "@/controllers/config.controller";

export async function GET(request: NextRequest) {
    return await configController.getSettings(request);
}

export async function POST(request: NextRequest) {
    return await configController.createSetting(request);
}
