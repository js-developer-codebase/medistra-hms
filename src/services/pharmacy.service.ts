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

    /**
     * Seed essential categories, medicines, and suppliers
     */
    static async seedEssentialPharmacy() {
        // 1. Categories
        const categories = [
            {
                name: "Antibiotics",
                code: "ANTI",
                description: "Broad-spectrum antibacterial agents",
                storageCondition: "ROOM_TEMPERATURE",
                requiresPrescription: true
            },
            {
                name: "Analgesics & Antipyretics",
                code: "ANAL",
                description: "Pain management and fever reduction",
                storageCondition: "ROOM_TEMPERATURE",
                requiresPrescription: false
            },
            {
                name: "Cardiovascular",
                code: "CARD",
                description: "Hypertension, cardiac glycosides, statins",
                storageCondition: "ROOM_TEMPERATURE",
                requiresPrescription: true
            },
            {
                name: "Gastrointestinal",
                code: "GAST",
                description: "Proton pump inhibitors, antacids, antiemetics",
                storageCondition: "ROOM_TEMPERATURE",
                requiresPrescription: false
            },
            {
                name: "Respiratory",
                code: "RESP",
                description: "Bronchodilators, inhalers, mucolytics",
                storageCondition: "ROOM_TEMPERATURE",
                requiresPrescription: true
            },
            {
                name: "IV Fluids & Electrolytes",
                code: "IVFL",
                description: "Parenteral infusion solutions",
                storageCondition: "ROOM_TEMPERATURE",
                requiresPrescription: true
            },
            {
                name: "Controlled Substances",
                code: "CTRL",
                description: "Schedule H1 narcotics and opioids",
                storageCondition: "NARCOTICS_VAULT",
                requiresPrescription: true
            },
            {
                name: "Biologicals & Vaccines",
                code: "BIOL",
                description: "Immunoglobulins, insulin, tetanus toxoid",
                storageCondition: "REFRIGERATED_2_8C",
                requiresPrescription: true
            }
        ];

        for (const cat of categories) {
            await MedicineCategory.findOneAndUpdate({ name: cat.name }, cat, { upsert: true });
        }

        // 2. Suppliers
        const suppliers = [
            {
                name: "Sun Pharma Distributors Ltd",
                code: "SUN-DIST",
                contactPerson: "Rajesh Sharma",
                phone: "+91 98765 43210",
                email: "orders@sunpharma-dist.in",
                address: "Plot 14, Okhla Industrial Area, New Delhi",
                gstin: "07AAACS1234F1Z5",
                dlNumber: "DL-20B/21B-DL1029",
                paymentTerms: "NET_30",
                leadTimeDays: 2,
                categoriesSupplied: ["Antibiotics", "Cardiovascular", "Gastrointestinal"]
            },
            {
                name: "Cipla Medical Supplies",
                code: "CIPLA-SUPP",
                contactPerson: "Ananya Iyer",
                phone: "+91 98111 22334",
                email: "hospitals@cipla-dist.com",
                address: "Bandra Kurla Complex, Mumbai, Maharashtra",
                gstin: "27AAACC4321G1Z8",
                dlNumber: "DL-20B/21B-MH8832",
                paymentTerms: "NET_15",
                leadTimeDays: 3,
                categoriesSupplied: ["Respiratory", "Antibiotics", "Biologicals & Vaccines"]
            },
            {
                name: "Dr. Reddy's Hospital Logistics",
                code: "REDDY-LOG",
                contactPerson: "K. Venkat Rao",
                phone: "+91 99000 77665",
                email: "institutional@drreddys.com",
                address: "Banjara Hills, Hyderabad, Telangana",
                gstin: "36AAACD9876H1Z2",
                dlNumber: "DL-20B/21B-TG5541",
                paymentTerms: "NET_30",
                leadTimeDays: 2,
                categoriesSupplied: ["Gastrointestinal", "Cardiovascular", "Analgesics & Antipyretics"]
            }
        ];

        for (const supp of suppliers) {
            await PharmacySupplier.findOneAndUpdate({ code: supp.code }, supp, { upsert: true });
        }

        // 3. Essential Medicines with realistic batches, racks, and prices in ₹
        const now = new Date();
        const medicines = [
            {
                name: "Paracetamol 650mg (Dolo)",
                category: "Analgesics & Antipyretics",
                genericName: "Paracetamol",
                dosageForm: "TABLET",
                manufacturer: "Micro Labs",
                batchNumber: "ML-PAR-2401",
                rackLocation: "Rack A-01",
                shelfNumber: "Shelf 1",
                hsnCode: "30049060",
                gstRate: 12,
                expiryDate: new Date(now.getFullYear() + 2, 5, 15),
                unitPrice: 32, // ₹32 per strip
                stockQuantity: 450,
                reorderLevel: 50,
                description: "Analgesic and antipyretic for mild-to-moderate pain and pyrexia"
            },
            {
                name: "Amoxicillin + Clavulanic Acid 625mg (Augmentin)",
                category: "Antibiotics",
                genericName: "Amoxicillin + Clavulanate",
                dosageForm: "TABLET",
                manufacturer: "GSK",
                batchNumber: "GSK-AUG-9912",
                rackLocation: "Rack B-03",
                shelfNumber: "Shelf 2",
                hsnCode: "30041010",
                gstRate: 12,
                expiryDate: new Date(now.getFullYear() + 1, 8, 20),
                unitPrice: 185, // ₹185 per strip
                stockQuantity: 180,
                reorderLevel: 30,
                description: "Broad spectrum penicillin antibiotic for bacterial infections"
            },
            {
                name: "Pantoprazole 40mg (Pan-40)",
                category: "Gastrointestinal",
                genericName: "Pantoprazole Sodium",
                dosageForm: "TABLET",
                manufacturer: "Alkem Labs",
                batchNumber: "ALK-PAN-3310",
                rackLocation: "Rack A-04",
                shelfNumber: "Shelf 3",
                hsnCode: "30049099",
                gstRate: 12,
                expiryDate: new Date(now.getFullYear() + 1, 11, 10),
                unitPrice: 145, // ₹145
                stockQuantity: 240,
                reorderLevel: 40,
                description: "Proton pump inhibitor for GERD and peptic ulcer disease"
            },
            {
                name: "Metformin 500mg SR (Glycomet)",
                category: "Cardiovascular",
                genericName: "Metformin Hydrochloride",
                dosageForm: "TABLET",
                manufacturer: "USV Ltd",
                batchNumber: "USV-GLY-7782",
                rackLocation: "Rack C-02",
                shelfNumber: "Shelf 1",
                hsnCode: "30049099",
                gstRate: 12,
                expiryDate: new Date(now.getFullYear() + 2, 2, 28),
                unitPrice: 42, // ₹42
                stockQuantity: 320,
                reorderLevel: 50,
                description: "First-line oral biguanide for type 2 diabetes mellitus"
            },
            {
                name: "Atorvastatin 20mg (Atorva)",
                category: "Cardiovascular",
                genericName: "Atorvastatin Calcium",
                dosageForm: "TABLET",
                manufacturer: "Zydus Cadila",
                batchNumber: "ZYD-ATO-1044",
                rackLocation: "Rack C-05",
                shelfNumber: "Shelf 2",
                hsnCode: "30049099",
                gstRate: 12,
                expiryDate: new Date(now.getFullYear() + 1, 6, 18),
                unitPrice: 168, // ₹168
                stockQuantity: 140,
                reorderLevel: 25,
                description: "HMG-CoA reductase inhibitor for hypercholesterolemia"
            },
            {
                name: "Ceftriaxone 1g Injection (Monocef)",
                category: "Antibiotics",
                genericName: "Ceftriaxone Sodium",
                dosageForm: "INJECTION",
                manufacturer: "Aristo Pharma",
                batchNumber: "ARI-CEF-5520",
                rackLocation: "Rack B-08",
                shelfNumber: "Shelf 4",
                hsnCode: "30042099",
                gstRate: 12,
                expiryDate: new Date(now.getFullYear(), now.getMonth() + 1, 15), // Expiring soon (<60 days) for test
                unitPrice: 75, // ₹75 per vial
                stockQuantity: 15, // Low stock alert
                reorderLevel: 30,
                description: "Third-generation cephalosporin IV/IM antibiotic"
            },
            {
                name: "Salbutamol 100mcg Inhaler (Asthalin)",
                category: "Respiratory",
                genericName: "Salbutamol Sulfate",
                dosageForm: "INHALER",
                manufacturer: "Cipla",
                batchNumber: "CIP-AST-8819",
                rackLocation: "Rack D-01",
                shelfNumber: "Shelf 1",
                hsnCode: "30049099",
                gstRate: 12,
                expiryDate: new Date(now.getFullYear() + 2, 4, 30),
                unitPrice: 155, // ₹155
                stockQuantity: 90,
                reorderLevel: 20,
                description: "Short-acting beta2-adrenergic agonist for acute bronchospasm"
            },
            {
                name: "Normal Saline 0.9% 500ml IV",
                category: "IV Fluids & Electrolytes",
                genericName: "Sodium Chloride 0.9%",
                dosageForm: "IV_FLUID",
                manufacturer: "Baxter Healthcare",
                batchNumber: "BAX-NS-4491",
                rackLocation: "Rack F-01",
                shelfNumber: "Floor Bay",
                hsnCode: "30049099",
                gstRate: 12,
                expiryDate: new Date(now.getFullYear() + 2, 9, 25),
                unitPrice: 52, // ₹52
                stockQuantity: 210,
                reorderLevel: 50,
                description: "Isotonic crystalloid fluid for intravenous rehydration"
            },
            {
                name: "Tramadol 50mg Injection",
                category: "Controlled Substances",
                genericName: "Tramadol Hydrochloride",
                dosageForm: "INJECTION",
                manufacturer: "Cadila Healthcare",
                batchNumber: "CAD-TRM-0081",
                rackLocation: "Narcotics Vault N-1",
                shelfNumber: "Locker A",
                hsnCode: "30049099",
                gstRate: 12,
                expiryDate: new Date(now.getFullYear() + 1, 7, 10),
                unitPrice: 28, // ₹28
                stockQuantity: 60,
                reorderLevel: 20,
                description: "Centrally acting opioid analgesic for post-operative pain"
            }
        ];

        for (const med of medicines) {
            await Medicine.findOneAndUpdate({ name: med.name }, med, { upsert: true });
        }

        return {
            success: true,
            message: `Seeded ${categories.length} categories, ${suppliers.length} suppliers, and ${medicines.length} essential medicines.`
        };
    }
}

export default PharmacyService;
