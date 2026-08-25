import { NextResponse } from "next/server";
import { MedicineService } from "@/services/medicine.service";

export class MedicineController {
    static async create(req: Request) {
        try {
            const data = await req.json();
            const medicine = await MedicineService.create(data);
            return NextResponse.json({ success: true, data: medicine }, { status: 201 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async getAll(req: Request) {
        try {
            const { searchParams } = new URL(req.url);
            const category = searchParams.get('category');
            const search = searchParams.get('search');
            
            const filter: any = {};
            if (category) filter.category = category;
            if (search) filter.name = { $regex: search, $options: 'i' };

            const medicines = await MedicineService.getAll(filter);
            return NextResponse.json({ success: true, data: medicines }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async getById(req: Request, { params }: { params: { id: string } }) {
        try {
            const medicine = await MedicineService.getById(params.id);
            if (!medicine) {
                return NextResponse.json({ success: false, message: 'Medicine not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: medicine }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async update(req: Request, { params }: { params: { id: string } }) {
        try {
            const data = await req.json();
            const medicine = await MedicineService.update(params.id, data);
            if (!medicine) {
                return NextResponse.json({ success: false, message: 'Medicine not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: medicine }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async delete(req: Request, { params }: { params: { id: string } }) {
        try {
            const medicine = await MedicineService.delete(params.id);
            if (!medicine) {
                return NextResponse.json({ success: false, message: 'Medicine not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: medicine }, { status: 200 });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }
}
