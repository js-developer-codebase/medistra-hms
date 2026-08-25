import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getInsuranceProviders, createInsuranceProvider, getInsuranceClaims, createInsuranceClaim } from "@/services/insurance.service";

export class InsuranceController {
    async createProvider(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data = await request.json();
            const provider = await createInsuranceProvider(data);
            return NextResponse.json({ success: true, data: provider }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
        }
    }

    async getProviders(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const organizationId = searchParams.get('organizationId');
            const providers = await getInsuranceProviders(organizationId as string);
            return NextResponse.json({ success: true, data: providers }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
        }
    }

    async createClaim(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const data = await request.json();
            const claim = await createInsuranceClaim(data);
            return NextResponse.json({ success: true, data: claim }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
        }
    }

    async getClaims(request: NextRequest): Promise<NextResponse> {
        try {
            await dbConnect();
            const { searchParams } = new URL(request.url);
            const organizationId = searchParams.get('organizationId');
            const claims = await getInsuranceClaims(organizationId as string);
            return NextResponse.json({ success: true, data: claims }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
        }
    }
}
export default new InsuranceController();
