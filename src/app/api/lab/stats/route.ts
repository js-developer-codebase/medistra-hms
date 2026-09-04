import { NextRequest } from "next/server";
import { getLabStats } from "@/controllers/lab-order.controller";

export async function GET(request: NextRequest) {
  return getLabStats(request);
}
