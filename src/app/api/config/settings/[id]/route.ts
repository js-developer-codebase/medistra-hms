import { NextRequest } from "next/server";
import configController from "@/controllers/config.controller";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return await configController.updateSetting(request, id);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return await configController.deleteSetting(request, id);
}
