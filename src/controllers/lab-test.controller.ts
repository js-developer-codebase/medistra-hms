import { NextResponse } from "next/server";
import * as labTestService from "../services/lab-test.service";
import dbConnect from "../lib/dbConnect";

export const getLabTests = async (req: Request) => {
  try {
    await dbConnect();
    const tests = await labTestService.getAllLabTests();
    return NextResponse.json({ success: true, data: tests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};

export const createLabTest = async (req: Request) => {
  try {
    await dbConnect();
    const body = await req.json();
    const test = await labTestService.createLabTest(body);
    return NextResponse.json({ success: true, data: test }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};

export const getLabTest = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    await dbConnect();
    const test = await labTestService.getLabTestById(params.id);
    if (!test) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: test });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};

export const updateLabTest = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    await dbConnect();
    const body = await req.json();
    const test = await labTestService.updateLabTest(params.id, body);
    if (!test) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: test });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};

export const deleteLabTest = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    await dbConnect();
    const test = await labTestService.deleteLabTest(params.id);
    if (!test) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};
