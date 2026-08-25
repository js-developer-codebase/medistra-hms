import { NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DashboardController from "@/controllers/dashboard.controller";

export async function GET(req: NextRequest) {
  await dbConnect();
  return DashboardController.getStats(req);
}
