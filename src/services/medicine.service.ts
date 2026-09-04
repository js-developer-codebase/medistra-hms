import Medicine from "@/models/medicine.model";
import { IMedicine } from "@/interfaces/medicine.interface";

export class MedicineService {
    static async create(data: Partial<IMedicine>) {
        return Medicine.create(data);
    }

    static async getAll(filter: any = {}) {
        return Medicine.find(filter).sort({ createdAt: -1 });
    }

    static async getById(id: string) {
        return Medicine.findById(id);
    }

    static async update(id: string, data: Partial<IMedicine>) {
        return Medicine.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id: string) {
        return Medicine.findByIdAndDelete(id);
    }
}

export default MedicineService;
