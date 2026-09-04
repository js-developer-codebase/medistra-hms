"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Boxes,
  RefreshCw,
  Search,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Sliders,
  Warehouse,
  Filter
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

export default function MasterStockLedgerPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itmRes, catRes] = await Promise.all([
        fetch("/api/inventory/items"),
        fetch("/api/inventory/categories")
      ]);

      const itmData = await itmRes.json();
      setItems(Array.isArray(itmData) ? itmData : []);

      const catData = await catRes.json();
      if (catData.success) {
        setCategories(catData.data || []);
      }
    } catch (err: any) {
      toast(err.message || "Failed to load master stock ledger", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    let totalValuation = 0;
    let healthyCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    items.forEach((item) => {
      const stock = item.currentStock || 0;
      const price = item.unitPrice || 0;
      const reorder = item.reorderLevel || 20;

      totalValuation += stock * price;
      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= reorder) {
        lowStockCount++;
      } else {
        healthyCount++;
      }
    });

    return {
      totalValuation,
      totalItems: items.length,
      healthyCount,
      lowStockCount,
      outOfStockCount
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.code || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.storageLocation || "").toLowerCase().includes(search.toLowerCase());

      const matchesCat = categoryFilter === "ALL" || item.category === categoryFilter;

      const stock = item.currentStock || 0;
      const reorder = item.reorderLevel || 20;
      let matchesStatus = true;

      if (statusFilter === "IN_STOCK") {
        matchesStatus = stock > reorder;
      } else if (statusFilter === "LOW_STOCK") {
        matchesStatus = stock > 0 && stock <= reorder;
      } else if (statusFilter === "OUT_OF_STOCK") {
        matchesStatus = stock === 0;
      }

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [items, search, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Master Stock Ledger &amp; Warehouse Bins
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time multi-location hospital inventory balances, storage rack allocations, and live asset valuations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            <Button size="sm" className="text-xs flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              <ArrowDownLeft className="h-3.5 w-3.5" />
              Stock In (GRN)
            </Button>
          </Link>

          <Link href="/inventory/stock-out">
            <Button size="sm" variant="outline" className="text-xs flex items-center gap-1 text-slate-700 dark:text-slate-200">
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-600" />
              Issue Stock
            </Button>
          </Link>

          <Link href="/inventory/adjustment">
            <Button size="sm" variant="outline" className="text-xs flex items-center gap-1 text-slate-700 dark:text-slate-200">
              <Sliders className="h-3.5 w-3.5 text-amber-600" />
              Adjust Stock
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Stock Asset</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {stats.totalValuation.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Live store valuation</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total SKU Lines</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.totalItems}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Cataloged medical items</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Warehouse className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Healthy Stock</p>
              <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                {stats.healthyCount}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Above safety threshold</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Low Stock Alert</p>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {stats.lowStockCount}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">At or below reorder level</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Out of Stock</p>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {stats.outOfStockCount}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Critical supply exhaustion</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by SKU code, item name, rack location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories ({items.length})</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="IN_STOCK">Adequate Stock</option>
                <option value="LOW_STOCK">Low Stock Warning</option>
                <option value="OUT_OF_STOCK">Stock Out (Zero)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Boxes className="h-4 w-4 text-emerald-600" />
            Live Hospital Stock Ledger ({filteredItems.length} entries)
          </CardTitle>
          <div className="text-xs text-slate-400">
            Valuation: <span className="font-bold text-emerald-600 font-mono">₹{filteredItems.reduce((s, i) => s + (i.currentStock || 0) * (i.unitPrice || 0), 0).toLocaleString("en-IN")}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>SKU Code</TableHead>
                <TableHead>Item Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Storage Bin / Rack</TableHead>
                <TableHead className="text-right">Available Stock</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead className="text-right">Unit Rate (₹)</TableHead>
                <TableHead className="text-right">Total Asset (₹)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-400">
                    Loading stock ledger...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-slate-400">
                    No stock entries match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const stock = item.currentStock || 0;
                  const reorder = item.reorderLevel || 20;
                  const unitPrice = item.unitPrice || 0;
                  const totalValuation = stock * unitPrice;
                  const isOut = stock === 0;
                  const isLow = !isOut && stock <= reorder;

                  return (
                    <TableRow key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {item.code}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-500">
                          UOM: {item.unit} {item.supplierName ? `• Vendor: ${item.supplierName}` : ""}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {item.category}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Warehouse className="h-3 w-3 text-slate-400" />
                          {item.storageLocation || "Central Stores"}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold">
                        <span className={isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-slate-900 dark:text-white"}>
                          {stock} {item.unit}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-mono text-slate-500">
                        {reorder} {item.unit}
                      </TableCell>

                      <TableCell className="text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                        ₹{unitPrice.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-emerald-600">
                        ₹{totalValuation.toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] ${
                            isOut
                              ? "bg-rose-600 text-white animate-pulse"
                              : isLow
                              ? "bg-amber-600 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {isOut ? "STOCK OUT" : isLow ? "LOW STOCK" : "ADEQUATE"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/inventory/transfer?itemId=${item._id}`}>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600" title="Transfer Store">
                              <ArrowLeftRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Link href={`/inventory/adjustment?itemId=${item._id}`}>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" title="Adjust / Audit">
                              <Sliders className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
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
