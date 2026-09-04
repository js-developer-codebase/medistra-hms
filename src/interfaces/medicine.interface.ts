import { Document } from 'mongoose';

export interface IMedicine extends Document {
    name: string;
    category: string;
    genericName?: string;
    dosageForm?: string; // TABLET, CAPSULE, SYRUP, INJECTION, OINTMENT, DROPS, INHALER
    manufacturer?: string;
    batchNumber?: string;
    rackLocation?: string;
    shelfNumber?: string;
    hsnCode?: string;
    gstRate?: number;
    expiryDate: Date;
    unitPrice: number;
    stockQuantity: number;
    reorderLevel: number;
    minStockLevel?: number;
    maxStockLevel?: number;
    description?: string;
    isActive: boolean;
}
