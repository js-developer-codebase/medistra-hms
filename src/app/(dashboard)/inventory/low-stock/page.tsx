"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  Search,
  IndianRupee,
  XCircle,
  TrendingDown,
  Building2,
  ShoppingCart,
  Boxes,
  ArrowDownLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function LowStockAlertsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory/low-stock");
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      } else {
        toast(data.message || "Failed to load low stock items", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error fetching shortages", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const metrics = useMemo(() => {
    let outOfStock = 0;
    let lowStock = 0;
    let totalReplenishCost = 0;
    const suppliers = new Set<string>();

    items.forEach((item) => {
      const stock = item.currentStock || 0;
      const reorder = item.reorderLevel || 20;
      const price = item.unitPrice || 0;
      const targetRestock = Math.max(reorder * 2 - stock, reorder);

      totalReplenishCost += targetRestock * price;
      if (stock === 0) {
        outOfStock++;
      } else {
        lowStock++;
      }
      if (item.supplierName) suppliers.add(item.supplierName);
    });

    return {
      outOfStock,
      lowStock,
      totalReplenishCost,
      supplierCount: suppliers.size
    };
  }, [items]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.code || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.supplierName || "").toLowerCase().includes(search.toLowerCase());

      const matchesCat = categoryFilter === "ALL" || item.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [items, search, categoryFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Reorder Point &amp; Critical Stockout Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time replenishment trigger desk for hospital consumables breaching reorder thresholds and safety stock margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/inventory/stock-in">
            <Button size="sm" className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <ArrowDownLeft className="h-3.5 w-3.5" />
              Direct Purchase Inward (GRN)
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Estimated Restock Cost</p>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {metrics.totalReplenishCost.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Budget required to restock</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Depleted (Zero Stock)</p>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {metrics.outOfStock} items
              </h3>
              <p className="text-[10px] text-rose-500 mt-0.5 font-medium">Critical patient supply stoppage</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Below Reorder Level</p>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {metrics.lowStock} items
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">At or under safety buffer</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Affected Suppliers</p>
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {metrics.supplierCount} vendors
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Vendors pending PO dispatch</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by SKU, item name, or vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Affected Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Boxes className="h-4 w-4 text-amber-600" />
            Hospital Replenishment Priority Queue ({filteredItems.length} lines)
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Purchase Reorder Indents
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>SKU Code</TableHead>
                <TableHead>Consumable Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Reorder Threshold</TableHead>
                <TableHead className="text-right">Suggested Restock</TableHead>
                <TableHead className="text-right">Estimated Cost (₹)</TableHead>
                <TableHead>Preferred Vendor</TableHead>
                <TableHead className="text-center">Severity</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-400">
                    Scanning inventory levels...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-emerald-600">
                    All inventory lines are adequately stocked above reorder thresholds!
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const stock = item.currentStock || 0;
                  const reorder = item.reorderLevel || 20;
                  const unitPrice = item.unitPrice || 0;
                  const suggestedRestock = Math.max(reorder * 2 - stock, reorder);
                  const estCost = suggestedRestock * unitPrice;
                  const isZero = stock === 0;

                  return (
                    <TableRow key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        {item.code}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {item.storageLocation || "Central Warehouse"} • UOM: {item.unit}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {item.category}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold">
                        <span className={isZero ? "text-rose-600 animate-pulse" : "text-amber-600"}>
                          {stock} {item.unit}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-mono text-slate-600 dark:text-slate-400">
                        {reorder} {item.unit}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        +{suggestedRestock} {item.unit}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{estCost.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {item.supplierName || "Apex Healthcare Ltd"}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            isZero
                              ? "bg-rose-600 text-white"
                              : "bg-amber-600 text-white"
                          }`}
                        >
                          {isZero ? "DEPLETED (0)" : "LOW BUFFER"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <Link href={`/inventory/stock-in`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600 hover:text-emerald-700">
                            Create GRN
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
