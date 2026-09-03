import { NextResponse } from "next/server";
import PharmacyService from "@/services/pharmacy.service";

export class PharmacyController {
    static async getStats(req: Request) {
        try {
            const stats = await PharmacyService.getPharmacyStats();
            return NextResponse.json({ success: true, data: stats }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async getDispenses(req: Request) {
        try {
            const { searchParams } = new URL(req.url);
            const status = searchParams.get("status");
            const filter: any = {};
            if (status) filter.paymentStatus = status;

            const dispenses = await PharmacyService.getAllDispenses(filter);
            return NextResponse.json({ success: true, data: dispenses }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async createDispense(req: Request) {
        try {
            const body = await req.json();
            const dispense = await PharmacyService.createDispense(body);
            return NextResponse.json({ success: true, data: dispense }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async getDispenseById(req: Request, { params }: { params: { id: string } }) {
        try {
            const dispense = await PharmacyService.getDispenseById(params.id);
            if (!dispense) {
                return NextResponse.json({ success: false, message: "Dispense not found" }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: dispense }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async getReturns(req: Request) {
        try {
            const returns = await PharmacyService.getAllReturns();
            return NextResponse.json({ success: true, data: returns }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async createReturn(req: Request) {
        try {
            const body = await req.json();
            const ret = await PharmacyService.createReturn(body);
            return NextResponse.json({ success: true, data: ret }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async adjustStock(req: Request) {
        try {
            const body = await req.json();
            const { medicineId, quantityChange, notes } = body;
            if (!medicineId || quantityChange === undefined) {
                return NextResponse.json({ success: false, message: "medicineId and quantityChange required" }, { status: 400 });
            }
            const updated = await PharmacyService.adjustStock(medicineId, Number(quantityChange), notes);
            return NextResponse.json({ success: true, data: updated }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async getCategories(req: Request) {
        try {
            const categories = await PharmacyService.getAllCategories();
            return NextResponse.json({ success: true, data: categories }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async createCategory(req: Request) {
        try {
            const body = await req.json();
            const category = await PharmacyService.createCategory(body);
            return NextResponse.json({ success: true, data: category }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async updateCategory(req: Request, { params }: { params: { id: string } }) {
        try {
            const body = await req.json();
            const category = await PharmacyService.updateCategory(params.id, body);
            return NextResponse.json({ success: true, data: category }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async deleteCategory(req: Request, { params }: { params: { id: string } }) {
        try {
            await PharmacyService.deleteCategory(params.id);
            return NextResponse.json({ success: true, message: "Category deleted" }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async getSuppliers(req: Request) {
        try {
            const suppliers = await PharmacyService.getAllSuppliers();
            return NextResponse.json({ success: true, data: suppliers }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async createSupplier(req: Request) {
        try {
            const body = await req.json();
            const supplier = await PharmacyService.createSupplier(body);
            return NextResponse.json({ success: true, data: supplier }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async updateSupplier(req: Request, { params }: { params: { id: string } }) {
        try {
            const body = await req.json();
            const supplier = await PharmacyService.updateSupplier(params.id, body);
            return NextResponse.json({ success: true, data: supplier }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async deleteSupplier(req: Request, { params }: { params: { id: string } }) {
        try {
            await PharmacyService.deleteSupplier(params.id);
            return NextResponse.json({ success: true, message: "Supplier deleted" }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async getExpiryAnalysis(req: Request) {
        try {
            const analysis = await PharmacyService.getExpiryAnalysis();
            return NextResponse.json({ success: true, data: analysis }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async seed(req: Request) {
        try {
            const result = await PharmacyService.seedEssentialPharmacy();
            return NextResponse.json({ success: true, data: result }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }
}

export default PharmacyController;
