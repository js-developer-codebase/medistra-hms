import { NextRequest, NextResponse } from "next/server";
import TaskController from "@/controllers/task.controller";

export async function POST(request: NextRequest): Promise<NextResponse> {
  return await TaskController.createTask(request);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return await TaskController.getTasks(request);
}
