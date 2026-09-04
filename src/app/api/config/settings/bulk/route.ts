import { NextRequest } from "next/server";
import configController from "@/controllers/config.controller";

export async function PUT(request: NextRequest) {
    return await configController.bulkUpdate(request);
}
