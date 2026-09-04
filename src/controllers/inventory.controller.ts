import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { inventoryService, InventoryService } from "@/services/inventory.service";
import { CreateInventoryDto, UpdateInventoryDto } from "@/dto/inventory.dto";

export class InventoryController {
  constructor(private svc: InventoryService = inventoryService) {}

  // 1. Stats
  async getStats(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const stats = await this.svc.getInventoryStats();
      return NextResponse.json({ success: true, data: stats });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 2. Items
  async getItems(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const category = searchParams.get("category");
      const search = searchParams.get("search");
      const filter: any = { isActive: true };

      if (category && category !== "ALL") filter.category = category;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } }
        ];
      }

      const items = await this.svc.getItems(filter);
      return NextResponse.json(items);
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async createItem(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const item = await this.svc.createItem(data);
      return NextResponse.json(item, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateItem(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const item = await this.svc.updateItem(params.id, data);
      return NextResponse.json({ success: true, data: item });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async deleteItem(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      await this.svc.deleteItem(params.id);
      return NextResponse.json({ success: true, message: "Item deleted" });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 3. Categories
  async getCategories(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const categories = await this.svc.getCategories();
      return NextResponse.json({ success: true, data: categories });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async createCategory(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const category = await this.svc.createCategory(data);
      return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async updateCategory(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const cat = await this.svc.updateCategory(params.id, data);
      return NextResponse.json({ success: true, data: cat });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async deleteCategory(request: NextRequest, params: { id: string }): Promise<NextResponse> {
    try {
      await dbConnect();
      await this.svc.deleteCategory(params.id);
      return NextResponse.json({ success: true, message: "Category deleted" });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 4. Stock In (GRN)
  async createStockIn(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const txn = await this.svc.createStockIn(data);
      return NextResponse.json({ success: true, data: txn }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 5. Stock Out (Department Issues)
  async createStockOut(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const txn = await this.svc.createStockOut(data);
      return NextResponse.json({ success: true, data: txn }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 6. Stock Transfers
  async getTransfers(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const transfers = await this.svc.getTransfers();
      return NextResponse.json({ success: true, data: transfers });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async createTransfer(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const transfer = await this.svc.createTransfer(data);
      return NextResponse.json({ success: true, data: transfer }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 7. Stock Adjustments
  async getAdjustments(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const adjustments = await this.svc.getAdjustments();
      return NextResponse.json({ success: true, data: adjustments });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async createAdjustment(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data = await request.json();
      const adjustment = await this.svc.createAdjustment(data);
      return NextResponse.json({ success: true, data: adjustment }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 8. Low Stock
  async getLowStock(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const lowStock = await this.svc.getLowStockItems();
      return NextResponse.json({ success: true, data: lowStock });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 9. Expiry
  async getExpiring(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const days = parseInt(searchParams.get("days") || "90", 10);
      const expiring = await this.svc.getExpiringTransactions(days);
      return NextResponse.json({ success: true, data: expiring });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 10. Transactions
  async getStockTransactions(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const { searchParams } = new URL(request.url);
      const type = searchParams.get("type");
      const filter: any = {};
      if (type && type !== "ALL") filter.transactionType = type;

      const txns = await this.svc.getStockTransactions(filter);
      return NextResponse.json({ success: true, data: txns });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getStockInList(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const txns = await this.svc.getStockTransactions({ transactionType: "IN" });
      return NextResponse.json({ success: true, data: txns });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  async getStockOutList(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const txns = await this.svc.getStockTransactions({ transactionType: "OUT" });
      return NextResponse.json({ success: true, data: txns });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // 11. Reports
  async getReports(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const reports = await this.svc.getInventoryReports();
      return NextResponse.json({ success: true, data: reports });
    } catch (e: any) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Legacy Inventory Methods (preserved for backwards compatibility)
  async createInventory(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const data: CreateInventoryDto = await request.json();
      const inventory = await this.svc.createItem(data as any);
      return NextResponse.json(
        { success: true, message: "Inventory item created successfully", data: inventory },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error?.message || "Failed to create inventory item" },
        { status: 500 }
      );
    }
  }

  async getInventories(request: NextRequest): Promise<NextResponse> {
    try {
      await dbConnect();
      const inventories = await this.svc.getItems();
      return NextResponse.json(
        { success: true, count: inventories.length, data: inventories },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error?.message || "Failed to fetch inventories" },
        { status: 500 }
      );
    }
  }

  async getInventoryById(id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const inventory = await this.svc.getItemById(new Types.ObjectId(id));
      if (!inventory) {
        return NextResponse.json(
          { success: false, message: "Inventory item not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: inventory }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error?.message || "Failed to fetch inventory item" },
        { status: 500 }
      );
    }
  }

  async updateInventory(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      const data: UpdateInventoryDto = await request.json();
      const inventory = await this.svc.updateItem(new Types.ObjectId(id), data as any);
      return NextResponse.json(
        { success: true, message: "Inventory item updated successfully", data: inventory },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error?.message || "Failed to update inventory item" },
        { status: 500 }
      );
    }
  }

  async deleteInventory(id: string): Promise<NextResponse> {
    try {
      await dbConnect();
      await this.svc.deleteItem(new Types.ObjectId(id));
      return NextResponse.json(
        { success: true, message: "Inventory item deleted successfully" },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error?.message || "Failed to delete inventory item" },
        { status: 500 }
      );
    }
  }
}

export const inventoryController = new InventoryController();
export default inventoryController;
