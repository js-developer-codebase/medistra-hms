"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Boxes,
  IndianRupee,
  Layers,
  AlertTriangle,
  PackagePlus,
  PackageMinus,
  RefreshCw,
  Building2,
  TrendingUp,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export default function InventoryDashboard() {
  const [stats, setStats] = useState<any>({
    totalItems: 0,
    totalStockValuation: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    categoriesCount: 0,
    todayInTransactions: 0,
    todayOutTransactions: 0,
    categoryDistribution: {}
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [sRes, txnRes] = await Promise.all([
        fetch("/api/inventory/stats"),
        fetch("/api/inventory/stock-transactions")
      ]);

      const sData = await sRes.json();
      if (sData.success) setStats(sData.data);

      const txnData = await txnRes.json();
      if (txnData.success) {
        setRecentTransactions(txnData.data?.slice(0, 6) || []);
      }
    } catch (err) {
      toast("Failed to load inventory dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Inventory &amp; Stores Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time stock asset valuation, category breakdown, consumption velocity, and reorder alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/inventory/stock">
            <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
              View Master Stock Ledger
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Stock Asset
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              ₹{(stats.totalStockValuation || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-slate-500">Capital valuation across stores</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Catalog Items
              <Layers className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalItems}
            </div>
            <p className="text-[10px] text-slate-500">Across {stats.categoriesCount} categories</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Low Stock Alert
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-amber-600">
              {stats.lowStockCount}
            </div>
            <p className="text-[10px] text-slate-500">&le; Reorder threshold</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Stockout Items
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {stats.outOfStockCount}
            </div>
            <p className="text-[10px] text-slate-500">Zero quantity available</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Category Distribution & Recent Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Stock Movements (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Recent Stock Movements (GRN Receipts &amp; Department Issues)
              </CardTitle>
              <Link href="/inventory/stock">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600">
                  Full Ledger &rarr;
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead>Txn Code</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Department / Source</TableHead>
                    <TableHead>Date / Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                        No recent stock transactions recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((txn) => (
                      <TableRow key={txn._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                          {txn.transactionCode || txn.reference}
                        </TableCell>

                        <TableCell className="font-semibold text-slate-900 dark:text-white">
                          {txn.itemName || txn.itemId?.name || "Hospital Supply"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`text-[9px] ${
                              txn.transactionType === "IN"
                                ? "bg-emerald-600 text-white"
                                : txn.transactionType === "OUT"
                                ? "bg-rose-600 text-white"
                                : "bg-indigo-600 text-white"
                            }`}
                          >
                            {txn.transactionType === "IN" ? "INWARD GRN" : txn.transactionType === "OUT" ? "DEPT ISSUE" : txn.transactionType}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                          {txn.quantity}
                        </TableCell>

                        <TableCell className="text-slate-600 dark:text-slate-300">
                          {txn.destinationDepartment || txn.sourceDepartment || "General Store"}
                        </TableCell>

                        <TableCell className="font-mono text-[11px]">
                          {new Date(txn.transactionDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right: Quick Action Gateways (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Boxes className="h-4 w-4 text-blue-600" />
                Storekeeper Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <Link href="/inventory/stock-in" className="block">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 border transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Goods Receipt Note (GRN)</div>
                    <div className="text-[10px] text-slate-500">Record supplier shipments &amp; batch intake</div>
                  </div>
                  <PackagePlus className="h-4 w-4 text-emerald-600" />
                </div>
              </Link>

              <Link href="/inventory/stock-out" className="block">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 border transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Department Dispensing</div>
                    <div className="text-[10px] text-slate-500">Issue consumables to OT, ICU, or Emergency</div>
                  </div>
                  <PackageMinus className="h-4 w-4 text-rose-600" />
                </div>
              </Link>

              <Link href="/inventory/transfer" className="block">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 border transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Inter-Store Transfer</div>
                    <div className="text-[10px] text-slate-500">Move items to satellite crash cart stores</div>
                  </div>
                  <Boxes className="h-4 w-4 text-cyan-600" />
                </div>
              </Link>

              <Link href="/inventory/adjustment" className="block">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 border transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Stock Audit Reconciliation</div>
                    <div className="text-[10px] text-slate-500">Adjust physical counts and write-offs</div>
                  </div>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
