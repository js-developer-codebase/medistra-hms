import { NextResponse } from "next/server";
import * as labOrderService from "../services/lab-order.service";
import dbConnect from "../lib/dbConnect";

export const getLabOrders = async (req: Request) => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const patient = searchParams.get("patient") || undefined;
    const barcode = searchParams.get("barcode") || undefined;

    const orders = await labOrderService.getAllLabOrders({ status, priority, patient, barcode });
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};

export const createLabOrder = async (req: Request) => {
  try {
    await dbConnect();
    const body = await req.json();
    const order = await labOrderService.createLabOrder(body);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};

export const getLabOrder = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const order = await labOrderService.getLabOrderById(id);
    if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};

export const updateLabOrder = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const order = await labOrderService.updateLabOrder(id, body);
    if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};

export const deleteLabOrder = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const order = await labOrderService.deleteLabOrder(id);
    if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};

export const getLabStats = async (req: Request) => {
  try {
    await dbConnect();
    const stats = await labOrderService.getLabStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};
