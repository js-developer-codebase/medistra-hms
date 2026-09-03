import Medicine from "@/models/medicine.model";
import MedicineCategory from "@/models/medicine-category.model";
import PharmacyDispense from "@/models/pharmacy-dispense.model";
import PharmacyReturn from "@/models/pharmacy-return.model";
import PharmacySupplier from "@/models/pharmacy-supplier.model";
import Prescription from "@/models/prescription.model";

export class PharmacyService {
    /**
     * Get aggregate statistics for the Pharmacy module
     */
    static async getPharmacyStats() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        // Medicines & Stock
        const medicines = await Medicine.find({ isActive: true });
        const totalMedicines = medicines.length;

        let totalStockValuation = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let expiredCount = 0;
        let expiringIn30DaysCount = 0;
        let expiringIn90DaysCount = 0;

        for (const med of medicines) {
            const stock = med.stockQuantity || 0;
            const price = med.unitPrice || 0;
            totalStockValuation += stock * price;

            if (stock === 0) outOfStockCount++;
            else if (stock <= (med.reorderLevel || 10)) lowStockCount++;

            if (med.expiryDate) {
                const exp = new Date(med.expiryDate);
                if (exp < now) expiredCount++;
                else if (exp <= thirtyDaysFromNow) expiringIn30DaysCount++;
                else if (exp <= ninetyDaysFromNow) expiringIn90DaysCount++;
            }
        }

        // Dispenses & Revenue
        const todayDispenses = await PharmacyDispense.find({
            createdAt: { $gte: startOfToday }
        });
        const todayDispensedCount = todayDispenses.length;
        const todayRevenue = todayDispenses.reduce((acc, d) => acc + (d.totalAmount || 0), 0);

        const totalDispensesCount = await PharmacyDispense.countDocuments();
        const allDispenses = await PharmacyDispense.find().select("totalAmount");
        const totalRevenue = allDispenses.reduce((acc, d) => acc + (d.totalAmount || 0), 0);

        // Prescriptions pending dispense
        const pendingPrescriptionsCount = await Prescription.countDocuments({
            dispenseStatus: { $in: ["PENDING", "PARTIAL", null] }
        });

        // Categories & Suppliers
        const totalCategories = await MedicineCategory.countDocuments({ isActive: true });
        const totalSuppliers = await PharmacySupplier.countDocuments({ isActive: true });

        // Total Returns
        const totalReturns = await PharmacyReturn.countDocuments();
        const returns = await PharmacyReturn.find().select("totalRefund");
        const totalRefundAmount = returns.reduce((acc, r) => acc + (r.totalRefund || 0), 0);

        return {
            totalMedicines,
            totalStockValuation: Math.round(totalStockValuation),
            lowStockCount,
            outOfStockCount,
            expiredCount,
            expiringIn30DaysCount,
            expiringIn90DaysCount,
            todayDispensedCount,
            todayRevenue: Math.round(todayRevenue),
            totalDispensesCount,
            totalRevenue: Math.round(totalRevenue),
            pendingPrescriptionsCount,
            totalCategories,
            totalSuppliers,
            totalReturns,
            totalRefundAmount: Math.round(totalRefundAmount)
        };
    }

    /**
     * Create a new Dispense transaction & atomically deduct medicine stock
     */
    static async createDispense(data: any) {
        // Auto-generate bill number if not supplied
        if (!data.billNumber) {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            data.billNumber = `PHARM-${dateStr}-${randomSuffix}`;
        }

        // 1. Check and decrement stock for each item
        if (data.items && Array.isArray(data.items)) {
            for (const item of data.items) {
                if (item.medicineId && item.quantity > 0) {
                    await Medicine.findByIdAndUpdate(item.medicineId, {
                        $inc: { stockQuantity: -item.quantity }
                    });
                }
            }
        }

        // 2. If linked to a prescription, mark prescription as DISPENSED
        if (data.prescriptionId) {
            await Prescription.findByIdAndUpdate(data.prescriptionId, {
                dispenseStatus: "DISPENSED",
                dispensedAt: new Date(),
                dispensedBy: data.dispensedBy || null
            });
        }

        // 3. Create Dispense Record
        const dispense = await PharmacyDispense.create(data);
        return dispense;
    }

    static async getAllDispenses(filter: any = {}) {
        return PharmacyDispense.find(filter)
            .populate("prescriptionId")
            .sort({ createdAt: -1 });
    }

    static async getDispenseById(id: string) {
        return PharmacyDispense.findById(id).populate("prescriptionId");
    }

    /**
     * Process a return of medicine with conditional restocking
     */
    static async createReturn(data: any) {
        if (!data.returnNumber) {
            const randomCode = Math.floor(100000 + Math.random() * 900000);
            data.returnNumber = `RET-${randomCode}`;
        }

        // Restock intact items
        if (data.items && Array.isArray(data.items)) {
            for (const item of data.items) {
                if (item.condition === "INTACT_RESTOCKABLE" && item.medicineId && item.quantity > 0) {
                    await Medicine.findByIdAndUpdate(item.medicineId, {
                        $inc: { stockQuantity: item.quantity }
                    });
                    item.restocked = true;
                } else {
                    item.restocked = false;
                }
            }
        }

        const ret = await PharmacyReturn.create(data);
        return ret;
    }

    static async getAllReturns(filter: any = {}) {
        return PharmacyReturn.find(filter).sort({ createdAt: -1 });
    }

    /**
     * Adjust stock directly (Stock-In or Stock-Out / Disposal)
     */
    static async adjustStock(medicineId: string, quantityChange: number, notes?: string) {
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) throw new Error("Medicine not found");

        const newQuantity = Math.max(0, (medicine.stockQuantity || 0) + quantityChange);
        medicine.stockQuantity = newQuantity;
        await medicine.save();
        return medicine;
    }

    /**
     * Category Operations
     */
    static async getAllCategories() {
        return MedicineCategory.find().sort({ name: 1 });
    }

    static async createCategory(data: any) {
        return MedicineCategory.create(data);
    }

    static async updateCategory(id: string, data: any) {
        return MedicineCategory.findByIdAndUpdate(id, data, { new: true });
    }

    static async deleteCategory(id: string) {
        return MedicineCategory.findByIdAndDelete(id);
    }

    /**
     * Supplier Operations
     */
    static async getAllSuppliers() {
        return PharmacySupplier.find().sort({ name: 1 });
    }

    static async createSupplier(data: any) {
        return PharmacySupplier.create(data);
    }

    static async updateSupplier(id: string, data: any) {
        return PharmacySupplier.findByIdAndUpdate(id, data, { new: true });
    }

    static async deleteSupplier(id: string) {
        return PharmacySupplier.findByIdAndDelete(id);
    }

    /**
     * Expiry analysis grouping
     */
    static async getExpiryAnalysis() {
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        const medicines = await Medicine.find({ isActive: true }).sort({ expiryDate: 1 });

        const expired: any[] = [];
        const critical30: any[] = [];
        const warning90: any[] = [];
        const good: any[] = [];

        for (const med of medicines) {
            if (!med.expiryDate) {
                good.push(med);
                continue;
            }
            const exp = new Date(med.expiryDate);
            if (exp < now) {
                expired.push(med);
            } else if (exp <= thirtyDays) {
                critical30.push(med);
            } else if (exp <= ninetyDays) {
                warning90.push(med);
            } else {
                good.push(med);
            }
        }

        return {
            expired,
            critical30,
            warning90,
            good
        };
    }
}

export default PharmacyService;
