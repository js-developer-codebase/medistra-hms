import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { getBloodDonors, createBloodDonor, getBloodInventory, createBloodInventory } from "@/services/blood-bank.service";

export class BloodBankController {
    async createDonor(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data = await request.json();
            const donor = await createBloodDonor(data);
            return NextResponse.json({ success: true, data: donor }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
        }
    }

    async getDonors(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const organizationId = searchParams.get('organizationId');
            const donors = await getBloodDonors(organizationId as string);
            return NextResponse.json({ success: true, data: donors }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
        }
    }

    async createInventory(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data = await request.json();
            const inv = await createBloodInventory(data);
            return NextResponse.json({ success: true, data: inv }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
        }
    }

    async getInventory(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const organizationId = searchParams.get('organizationId');
            const invs = await getBloodInventory(organizationId as string);
            return NextResponse.json({ success: true, data: invs }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
        }
    }
}
export default new BloodBankController();
