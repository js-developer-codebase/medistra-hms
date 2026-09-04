import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import InventoryItem from "@/models/inventory-item.model";
import InventoryCategory, { IInventoryCategory } from "@/models/inventory-category.model";
import StockTransaction from "@/models/stock-transaction.model";
import StockTransfer, { IStockTransfer } from "@/models/stock-transfer.model";
import StockAdjustment, { IStockAdjustment } from "@/models/stock-adjustment.model";
import { IInventoryItem } from "@/interfaces/inventory-item.interface";
import { IStockTransaction } from "@/interfaces/stock-transaction.interface";

export class InventoryService {
  // Live Inventory Statistics & KPI Summary
  async getInventoryStats() {
    await dbConnect();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [items, categoriesCount, todayInTransactions, todayOutTransactions] =
      await Promise.all([
        InventoryItem.find({ isActive: true }),
        InventoryCategory.countDocuments({ isActive: true }),
        StockTransaction.countDocuments({
          transactionType: "IN",
          transactionDate: { $gte: todayStart, $lte: todayEnd }
        }),
        StockTransaction.countDocuments({
          transactionType: "OUT",
          transactionDate: { $gte: todayStart, $lte: todayEnd }
        })
      ]);

    const totalItems = items.length;
    let totalStockValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const categoryDistribution: Record<string, number> = {};

    for (const item of items) {
      totalStockValuation += (item.currentStock || 0) * (item.unitPrice || 0);
      if (item.currentStock === 0) {
        outOfStockCount++;
      } else if (item.currentStock <= item.reorderLevel) {
        lowStockCount++;
      }
      categoryDistribution[item.category] =
        (categoryDistribution[item.category] || 0) + 1;
    }

    return {
      totalItems,
      totalStockValuation,
      lowStockCount,
      outOfStockCount,
      categoriesCount,
      todayInTransactions,
      todayOutTransactions,
      categoryDistribution
    };
  }

  // 1. Items Master Catalog
  async getItems(filter: any = {}) {
    await dbConnect();
    return await InventoryItem.find(filter).sort({ createdAt: -1 });
  }

  async getItemById(id: string | Types.ObjectId) {
    await dbConnect();
    return await InventoryItem.findById(id);
  }

  async createItem(data: Partial<IInventoryItem>) {
    await dbConnect();
    if (!data.code) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.code = `ITM-${randomSuffix}`;
    }
    const item = new InventoryItem(data);
    const saved = await item.save();

    // Increment category itemCount
    if (data.category) {
      await InventoryCategory.findOneAndUpdate(
        { name: data.category },
        { $inc: { itemCount: 1 } }
      );
    }

    return saved;
  }

  async updateItem(id: string | Types.ObjectId, data: Partial<IInventoryItem>) {
    await dbConnect();
    return await InventoryItem.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteItem(id: string | Types.ObjectId) {
    await dbConnect();
    return await InventoryItem.findByIdAndDelete(id);
  }

  // 2. Categories
  async getCategories() {
    await dbConnect();
    return await InventoryCategory.find().sort({ name: 1 });
  }

  async createCategory(data: Partial<IInventoryCategory>) {
    await dbConnect();
    if (!data.code) {
      data.code = `CAT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }
    const cat = new InventoryCategory(data);
    return await cat.save();
  }

  async updateCategory(id: string | Types.ObjectId, data: Partial<IInventoryCategory>) {
    await dbConnect();
    return await InventoryCategory.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCategory(id: string | Types.ObjectId) {
    await dbConnect();
    return await InventoryCategory.findByIdAndDelete(id);
  }

  // 3. Stock In (GRN)
  async createStockIn(data: any) {
    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const transactionCode = `GRN-${todayStr}-${randomSuffix}`;
    const item = await InventoryItem.findById(data.itemId);
    if (!item) throw new Error("Inventory item not found");

    const quantity = Number(data.quantity) || 0;
    const unitPrice = Number(data.unitPrice) || item.unitPrice || 0;
    const totalAmount = quantity * unitPrice;

    // Increment item stock
    item.currentStock += quantity;
    if (data.unitPrice) item.unitPrice = unitPrice;
    await item.save();

    // Create Stock Transaction
    const txn = new StockTransaction({
      transactionCode,
      itemId: item._id,
      itemName: item.name,
      transactionType: "IN",
      quantity,
      batchNumber: data.batchNumber || `BAT-${todayStr}`,
      expiryDate: data.expiryDate,
      unitPrice,
      totalAmount,
      sourceDepartment: data.supplierName || "Direct Vendor",
      destinationDepartment: data.storageLocation || item.storageLocation || "Central Warehouse",
      reference: data.invoiceNumber || data.poNumber || transactionCode,
      notes: data.notes,
      performedByName: data.inspectedBy || "Storekeeper"
    });

    return await txn.save();
  }

  // 4. Stock Out (Department Issues)
  async createStockOut(data: any) {
    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const transactionCode = `ISS-${todayStr}-${randomSuffix}`;
    const item = await InventoryItem.findById(data.itemId);
    if (!item) throw new Error("Inventory item not found");

    const quantity = Number(data.quantity) || 0;
    if (item.currentStock < quantity) {
      throw new Error(`Insufficient stock: Only ${item.currentStock} units available.`);
    }

    const unitPrice = item.unitPrice || 0;
    const totalAmount = quantity * unitPrice;

    // Decrement item stock
    item.currentStock -= quantity;
    await item.save();

    // Create Stock Transaction
    const txn = new StockTransaction({
      transactionCode,
      itemId: item._id,
      itemName: item.name,
      transactionType: "OUT",
      quantity,
      batchNumber: data.batchNumber,
      unitPrice,
      totalAmount,
      sourceDepartment: item.storageLocation || "Central Warehouse",
      destinationDepartment: data.department || "Emergency Ward",
      reference: data.requisitionNumber || transactionCode,
      notes: data.notes,
      performedByName: data.issuedTo || "Department Nurse"
    });

    return await txn.save();
  }

  // 5. Stock Transactions Ledger
  async getStockTransactions(filter: any = {}) {
    await dbConnect();
    return await StockTransaction.find(filter)
      .populate("itemId")
      .sort({ transactionDate: -1 });
  }

  // 6. Stock Transfers
  async getTransfers(filter: any = {}) {
    await dbConnect();
    return await StockTransfer.find(filter)
      .populate("itemId")
      .sort({ transferDate: -1 });
  }

  async createTransfer(data: Partial<IStockTransfer>) {
    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    if (!data.transferCode) {
      data.transferCode = `TRF-${todayStr}-${randomSuffix}`;
    }

    const item = await InventoryItem.findById(data.itemId);
    if (!item) throw new Error("Item not found");

    if (item.currentStock < (data.quantity || 0)) {
      throw new Error(`Insufficient stock in ${data.sourceLocation} for transfer.`);
    }

    const transfer = new StockTransfer({
      ...data,
      itemName: item.name,
      status: "COMPLETED"
    });
    const saved = await transfer.save();

    // Log Stock Transaction for audit
    await StockTransaction.create({
      transactionCode: data.transferCode,
      itemId: item._id,
      itemName: item.name,
      transactionType: "TRANSFER",
      quantity: data.quantity,
      batchNumber: data.batchNumber,
      unitPrice: item.unitPrice,
      totalAmount: (data.quantity || 0) * (item.unitPrice || 0),
      sourceDepartment: data.sourceLocation,
      destinationDepartment: data.destinationLocation,
      reference: data.transferCode,
      notes: `Transferred to ${data.destinationLocation}`,
      performedByName: data.requestedBy || "Storekeeper"
    });

    return saved;
  }

  // 7. Stock Adjustments & Reconciliations
  async getAdjustments(filter: any = {}) {
    await dbConnect();
    return await StockAdjustment.find(filter)
      .populate("itemId")
      .sort({ adjustmentDate: -1 });
  }

  async createAdjustment(data: any) {
    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const adjustmentCode = `ADJ-${todayStr}-${randomSuffix}`;
    const item = await InventoryItem.findById(data.itemId);
    if (!item) throw new Error("Item not found");

    const previousStock = item.currentStock || 0;
    const physicalCount = Number(data.physicalCount);
    const difference = physicalCount - previousStock;
    const costImpact = Math.abs(difference * (item.unitPrice || 0));

    // Update item stock to match physical count
    item.currentStock = physicalCount;
    await item.save();

    const adjustment = new StockAdjustment({
      adjustmentCode,
      itemId: item._id,
      itemName: item.name,
      batchNumber: data.batchNumber,
      previousStock,
      physicalCount,
      difference,
      adjustmentType: data.adjustmentType || "AUDIT_DEFICIT",
      unitPrice: item.unitPrice || 0,
      costImpact,
      reason: data.reason,
      adjustedBy: data.adjustedBy || "Store Auditor",
      approvedBy: data.approvedBy || "Inventory Manager"
    });

    const savedAdjustment = await adjustment.save();

    // Log transaction
    await StockTransaction.create({
      transactionCode: adjustmentCode,
      itemId: item._id,
      itemName: item.name,
      transactionType: "ADJUSTMENT",
      quantity: difference,
      unitPrice: item.unitPrice || 0,
      totalAmount: costImpact,
      sourceDepartment: "Physical Inventory Audit",
      reference: adjustmentCode,
      notes: `${data.adjustmentType}: ${data.reason}`,
      performedByName: data.adjustedBy || "Store Auditor"
    });

    return savedAdjustment;
  }

  // 8. Low Stock Items
  async getLowStockItems() {
    await dbConnect();
    const items = await InventoryItem.find({ isActive: true });
    return items.filter((item) => item.currentStock <= item.reorderLevel);
  }

  // 9. Expiry Tracking
  async getExpiringTransactions(daysThreshold: number = 90) {
    await dbConnect();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysThreshold);

    return await StockTransaction.find({
      expiryDate: { $lte: targetDate, $ne: null }
    })
      .populate("itemId")
      .sort({ expiryDate: 1 });
  }

  async createStockTransaction(data: any) {
    await dbConnect();
    const txn = new StockTransaction(data);
    return await txn.save();
  }

  // 10. Inventory Reports & ABC Analysis
  async getInventoryReports() {
    await dbConnect();
    const items = await InventoryItem.find({ isActive: true });
    const transactions = await StockTransaction.find().sort({ transactionDate: -1 }).limit(500);
    const adjustments = await StockAdjustment.find().sort({ adjustmentDate: -1 }).limit(100);

    const itemsWithValuation = items.map((item) => ({
      _id: item._id,
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      currentStock: item.currentStock || 0,
      reorderLevel: item.reorderLevel || 0,
      unitPrice: item.unitPrice || 0,
      totalValue: (item.currentStock || 0) * (item.unitPrice || 0)
    })).sort((a, b) => b.totalValue - a.totalValue);

    const totalValuation = itemsWithValuation.reduce((sum, itm) => sum + itm.totalValue, 0);
    let runningSum = 0;
    const abcAnalysis = itemsWithValuation.map((item) => {
      runningSum += item.totalValue;
      const percentage = totalValuation > 0 ? (runningSum / totalValuation) * 100 : 0;
      let classification = "C";
      if (percentage <= 70) classification = "A";
      else if (percentage <= 90) classification = "B";
      return {
        ...item,
        cumPercentage: Math.round(percentage),
        classification
      };
    });

    const departmentConsumption: Record<string, { count: number; totalAmount: number }> = {};
    for (const txn of transactions) {
      if (txn.transactionType === "OUT" && txn.destinationDepartment) {
        if (!departmentConsumption[txn.destinationDepartment]) {
          departmentConsumption[txn.destinationDepartment] = { count: 0, totalAmount: 0 };
        }
        departmentConsumption[txn.destinationDepartment].count += (txn.quantity || 0);
        departmentConsumption[txn.destinationDepartment].totalAmount += (txn.totalAmount || 0);
      }
    }

    const totalAdjustmentLoss = adjustments
      .filter((a) => a.difference < 0)
      .reduce((sum, a) => sum + (a.costImpact || 0), 0);

    return {
      totalValuation,
      totalItems: items.length,
      abcAnalysis,
      departmentConsumption,
      totalAdjustmentLoss,
      recentAdjustmentsCount: adjustments.length,
      recentTransactionsCount: transactions.length
    };
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;
