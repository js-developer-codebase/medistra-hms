import { NextRequest } from "next/server";
import radiologyController from "@/controllers/radiology.controller";

export async function GET(request: NextRequest) {
    return radiologyController.getOrders(request);
}

export async function POST(request: NextRequest) {
    return radiologyController.createOrder(request);
}
