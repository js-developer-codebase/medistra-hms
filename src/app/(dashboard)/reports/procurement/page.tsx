"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  IndianRupee,
  Building2,
  CheckCircle2,
  Clock,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ProcurementReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("ALL_TIME");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/procurement?timeframe=${timeframe}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load procurement reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading procurement reports: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const totalPurchaseOrders = data?.totalPurchaseOrders || 0;
  const totalPOValue = data?.totalPOValue || 0;
  const statusBreakdown = data?.statusBreakdown || {};
  const topSuppliers: any[] = data?.topSuppliers || [];
  const recentPurchaseOrders: any[] = data?.recentPurchaseOrders || [];

  const filteredOrders = recentPurchaseOrders.filter((po) => {
    const q = searchQuery.toLowerCase();
    return (
      po.poNumber?.toLowerCase().includes(q) ||
      po.supplierName?.toLowerCase().includes(q) ||
      po.status?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ["PO Number", "Supplier Name", "Order Date", "Total Amount (INR)", "Status"];
    const rows = recentPurchaseOrders.map((po) => [
      `"${po.poNumber}"`,
      `"${po.supplierName}"`,
      po.orderDate ? new Date(po.orderDate).toLocaleDateString("en-IN") : "N/A",
      po.totalAmount,
      po.status || "ORDERED"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Procurement_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Procurement report exported to CSV", "success");
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
            <span className="text-sm font-medium text-primary">Procurement & POs</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Procurement Spend & Purchase Order Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Audited hospital purchase orders, vendor allocation commitments, and procurement spend in ₹.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="h-8 text-xs rounded-md border border-input bg-background px-2.5 text-foreground focus:ring-1 focus:ring-primary"
          >
            <option value="ALL_TIME">All Time</option>
            <option value="TODAY">Today</option>
            <option value="7_DAYS">Last 7 Days</option>
            <option value="30_DAYS">Last 30 Days</option>
            <option value="QUARTER">Last 90 Days</option>
            <option value="YTD">Year to Date (YTD)</option>
          </select>
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
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total PO Commitments</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">
                ₹{Number(totalPOValue || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Across {totalPurchaseOrders} purchase orders</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Orders Received / Closed</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                {(statusBreakdown.RECEIVED || 0) + (statusBreakdown.CLOSED || 0)}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Goods delivered & inspected</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Dispatched</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">
                {(statusBreakdown.ORDERED || 0) + (statusBreakdown.APPROVED || 0)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Awaiting delivery to warehouse</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Empaneled Vendors</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">{topSuppliers.length}</h3>
              <p className="text-xs text-muted-foreground mt-1">Active hospital suppliers</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Top Suppliers + Purchase Orders Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Suppliers (1 col) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold">Top Vendor Spend</CardTitle>
            <CardDescription className="text-xs">Procurement volume by equipment & drug vendor.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {topSuppliers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No purchase orders recorded.
              </div>
            ) : (
              topSuppliers.map((sup, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-muted/40 text-xs">
                  <span className="font-medium text-foreground truncate max-w-[180px]">{sup.name}</span>
                  <span className="font-bold text-primary font-mono">
                    ₹{Number(sup.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Purchase Orders Table (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Purchase Order Commitments Ledger</CardTitle>
                  <CardDescription className="text-xs">Approved orders and delivery tracking.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search PO #, vendor..."
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
                      <th className="p-3">PO Number</th>
                      <th className="p-3">Supplier Name</th>
                      <th className="p-3">Order Date</th>
                      <th className="p-3 text-right">PO Amount (₹)</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                          {loading ? "Loading purchase orders..." : "No purchase orders found."}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((po: any) => (
                        <tr key={po._id} className="hover:bg-muted/30 text-xs">
                          <td className="p-3 font-mono font-medium text-primary">{po.poNumber}</td>
                          <td className="p-3 text-muted-foreground">{po.supplierName}</td>
                          <td className="p-3 text-muted-foreground">
                            {po.orderDate ? new Date(po.orderDate).toLocaleDateString("en-IN") : "N/A"}
                          </td>
                          <td className="p-3 text-right font-bold text-foreground">
                            ₹{Number(po.totalAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                po.status === "RECEIVED" || po.status === "CLOSED"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                                  : po.status === "CANCELLED"
                                  ? "bg-rose-50 text-rose-600 border-rose-300"
                                  : "bg-blue-50 text-blue-600 border-blue-300"
                              }`}
                            >
                              {po.status || "ORDERED"}
                            </Badge>
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
