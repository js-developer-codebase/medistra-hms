"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function InventoryReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports/inventory");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load inventory reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading inventory reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalItemTypes = data?.totalItemTypes || 0;
  const totalStockUnits = data?.totalStockUnits || 0;
  const totalValuation = data?.totalValuation || 0;
  const lowStockCount = data?.lowStockCount || 0;
  const categoryDistribution = data?.categoryDistribution || {};
  const criticalItems: any[] = data?.criticalItems || [];

  const filteredItems = criticalItems.filter((i) => {
    const q = searchQuery.toLowerCase();
    return (
      i.name?.toLowerCase().includes(q) ||
      i.code?.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Item Name", "Code", "Category", "Current Stock", "Reorder Level", "Unit Price (INR)", "Valuation (INR)"];
    const rows = criticalItems.map((i) => [
      `"${i.name}"`,
      i.code,
      `"${i.category}"`,
      i.currentStock,
      i.reorderLevel,
      i.unitPrice,
      Number(i.currentStock || 0) * Number(i.unitPrice || 0)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventory_Stock_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Inventory report exported to CSV", "success");
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/reports" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Reports Hub
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-sm font-medium text-primary">Inventory Valuation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Hospital Inventory & Stock Valuation Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited central store inventory valuation in ₹, reorder stock buffers, and consumable depletion tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Stock Valuation</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                ₹{Number(totalValuation || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Hospital warehouse inventory</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Stock Units</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {Number(totalStockUnits || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{totalItemTypes} distinct catalog items</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600">{lowStockCount}</h3>
              <p className="text-xs text-rose-600 font-medium mt-1">Below safety reorder threshold</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock Categories</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">
                {Object.keys(categoryDistribution).length}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Surgical, PPE, Devices & Reagents</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Category Breakdown + Critical Reorder List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Valuation (1 col) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold">Category Valuations</CardTitle>
            <CardDescription className="text-xs">Inventory value across supply categories.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {Object.entries(categoryDistribution).map(([cat, info]: [string, any]) => (
              <div key={cat} className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-foreground">
                  <span>{cat}</span>
                  <span className="text-emerald-600 font-mono">
                    ₹{Number(info.valuation || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-muted-foreground text-[11px]">
                  {info.count} total units on hand
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Critical Reorder Threshold Items (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Critical Stock & Reorder Watchlist</CardTitle>
                  <CardDescription className="text-xs">Supplies requiring immediate procurement replenishment.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search item, SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold text-xs uppercase border-b border-border/60">
                    <tr>
                      <th className="p-3">Item Name & SKU</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-center">Stock Level</th>
                      <th className="p-3 text-center">Reorder Limit</th>
                      <th className="p-3 text-right">Unit Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                          {loading ? "Loading inventory items..." : "No items below reorder threshold."}
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item: any) => (
                        <tr key={item._id} className="hover:bg-muted/30 text-xs">
                          <td className="p-3">
                            <div className="font-semibold text-foreground">{item.name}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">{item.code}</div>
                          </td>
                          <td className="p-3 text-muted-foreground">{item.category}</td>
                          <td className="p-3 text-center">
                            <span className="font-bold text-rose-600 font-mono">{item.currentStock}</span>
                          </td>
                          <td className="p-3 text-center text-muted-foreground font-mono">
                            {item.reorderLevel}
                          </td>
                          <td className="p-3 text-right font-medium text-foreground">
                            ₹{Number(item.unitPrice || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
