import { Document } from 'mongoose';

export interface IMedicine extends Document {
    name: string;
    category: string;
    genericName?: string;
    manufacturer?: string;
    batchNumber?: string;
    expiryDate: Date;
    unitPrice: number;
    stockQuantity: number;
    reorderLevel: number;
    description?: string;
    isActive: boolean;
}
