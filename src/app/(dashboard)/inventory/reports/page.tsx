"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  RefreshCw,
  Search,
  IndianRupee,
  Download,
  Building2,
  PieChart,
  ShieldCheck,
  TrendingDown,
  FileSpreadsheet,
  Layers
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

export default function InventoryReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"ABC" | "DEPT" | "AUDIT">("ABC");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [abcClassFilter, setAbcClassFilter] = useState("ALL");
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory/reports");
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        toast(data.message || "Failed to load inventory reports", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error generating reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const abcItems = reportData?.abcAnalysis || [];
  const deptConsumption = reportData?.departmentConsumption || {};

  const classACount = abcItems.filter((i: any) => i.classification === "A").length;
  const classBCount = abcItems.filter((i: any) => i.classification === "B").length;
  const classCCount = abcItems.filter((i: any) => i.classification === "C").length;

  const filteredAbc = useMemo(() => {
    return abcItems.filter((item: any) => {
      const matchesSearch =
        (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.code || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.category || "").toLowerCase().includes(search.toLowerCase());

      const matchesClass = abcClassFilter === "ALL" || item.classification === abcClassFilter;
      return matchesSearch && matchesClass;
    });
  }, [abcItems, search, abcClassFilter]);

  const handleExportCSV = () => {
    if (activeTab === "ABC") {
      const headers = ["SKU Code", "Item Name", "Category", "Stock", "Unit", "Unit Price (INR)", "Total Value (INR)", "Cum %", "ABC Class"];
      const rows = filteredAbc.map((i: any) => [
        i.code,
        `"${i.name.replace(/"/g, '""')}"`,
        `"${i.category}"`,
        i.currentStock,
        i.unit,
        i.unitPrice,
        i.totalValue,
        i.cumPercentage,
        i.classification
      ]);
      const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Inventory_ABC_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast("ABC Inventory Report exported to CSV", "success");
    } else if (activeTab === "DEPT") {
      const headers = ["Department", "Units Issued", "Total Consumption Cost (INR)"];
      const rows = Object.entries(deptConsumption).map(([dept, data]: any) => [
        `"${dept}"`,
        data.count,
        data.totalAmount
      ]);
      const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Department_Consumption_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast("Department Consumption Report exported to CSV", "success");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Hospital Inventory Audits &amp; ABC/VED Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ABC classification matrix, departmental consumption audits, write-off shrinkage reports, and asset valuation in ₹.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleExportCSV}
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV Audit Report
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Inventory Capital</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {(reportData?.totalValuation || 0).toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Live store asset value</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Class A (Top 70% Value)</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {classACount} items
              </h3>
              <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">Highest financial scrutiny</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <PieChart className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Class B (Next 20% Value)</p>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {classBCount} items
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Moderate capital allocation</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Class C (Bulk 10% Value)</p>
              <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mt-1">
                {classCCount} items
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">High volume, lower cost</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("ABC")}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "ABC"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          ABC Inventory Classification
        </button>
        <button
          onClick={() => setActiveTab("DEPT")}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "DEPT"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Departmental Consumption Audit
        </button>
        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "AUDIT"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Variance &amp; Shrinkage Analysis
        </button>
      </div>

      {/* Tab 1: ABC Analysis */}
      {activeTab === "ABC" && (
        <div className="space-y-4">
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by SKU, item name, category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 text-xs"
                  />
                </div>

                <div>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={abcClassFilter}
                    onChange={(e) => setAbcClassFilter(e.target.value)}
                  >
                    <option value="ALL">All ABC Classes ({abcItems.length})</option>
                    <option value="A">Class A (Top 70% Value - {classACount} items)</option>
                    <option value="B">Class B (Next 20% Value - {classBCount} items)</option>
                    <option value="C">Class C (Bulk 10% Value - {classCCount} items)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PieChart className="h-4 w-4 text-emerald-600" />
                ABC Classification Matrix ({filteredAbc.length} lines)
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Pareto Valuation
              </Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead>SKU</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Stock Quantity</TableHead>
                    <TableHead className="text-right">Unit Rate (₹)</TableHead>
                    <TableHead className="text-right">Total Asset Value (₹)</TableHead>
                    <TableHead className="text-right">Cumulative %</TableHead>
                    <TableHead className="text-center">ABC Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                        Calculating Pareto distribution...
                      </TableCell>
                    </TableRow>
                  ) : filteredAbc.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                        No items found in this classification.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAbc.map((item: any) => {
                      return (
                        <TableRow key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                            {item.code}
                          </TableCell>

                          <TableCell className="font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {item.category}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right font-mono font-semibold">
                            {item.currentStock} {item.unit}
                          </TableCell>

                          <TableCell className="text-right font-mono text-slate-600">
                            ₹{(item.unitPrice || 0).toLocaleString("en-IN")}
                          </TableCell>

                          <TableCell className="text-right font-mono font-bold text-emerald-600">
                            ₹{(item.totalValue || 0).toLocaleString("en-IN")}
                          </TableCell>

                          <TableCell className="text-right font-mono text-slate-500">
                            {item.cumPercentage}%
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              className={`text-[9px] font-bold ${
                                item.classification === "A"
                                  ? "bg-purple-600 text-white"
                                  : item.classification === "B"
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-500 text-white"
                              }`}
                            >
                              CLASS {item.classification}
                            </Badge>
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
      )}

      {/* Tab 2: Departmental Consumption */}
      {activeTab === "DEPT" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Departmental Cost &amp; Consumption Summary
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Direct Internal Billing
            </Badge>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Clinical / Operational Department</TableHead>
                  <TableHead className="text-right">Total Units Drawn</TableHead>
                  <TableHead className="text-right">Total Financial Consumption (₹)</TableHead>
                  <TableHead className="text-center">Consumption Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(deptConsumption).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                      No departmental issues logged yet. Consumptions will appear when items are issued.
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(deptConsumption).map(([dept, data]: any) => {
                    const totalDeptSpend = Object.values(deptConsumption).reduce((s: number, d: any) => s + (d.totalAmount || 0), 0);
                    const share = totalDeptSpend > 0 ? Math.round((data.totalAmount / totalDeptSpend) * 100) : 0;

                    return (
                      <TableRow key={dept} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <TableCell className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          {dept}
                        </TableCell>

                        <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                          {data.count.toLocaleString("en-IN")} units
                        </TableCell>

                        <TableCell className="text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                          ₹{data.totalAmount.toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs font-mono">
                            {share}% of Store Total
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Variance & Shrinkage Analysis */}
      {activeTab === "AUDIT" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              Store Shrinkage, Breakage &amp; Write-Off Losses
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Audit Variance Summary
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                <span className="text-xs font-medium text-rose-700 dark:text-rose-300">Total Write-Off Loss (₹)</span>
                <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  ₹{(reportData?.totalAdjustmentLoss || 0).toLocaleString("en-IN")}
                </h2>
                <p className="text-[11px] text-rose-500 mt-1">Cumulative loss from count shortages &amp; damage</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border">
                <span className="text-xs font-medium text-slate-500">Audit Discrepancies</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {reportData?.recentAdjustmentsCount || 0} events
                </h2>
                <p className="text-[11px] text-slate-400 mt-1">Adjustments logged in physical counts</p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Total Stock Ledger Movements</span>
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {reportData?.recentTransactionsCount || 0} movements
                </h2>
                <p className="text-[11px] text-emerald-600 mt-1">Inward, outward, and transfer ledger rows</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border text-xs space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Hospital Inventory Governance Policy
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Hospital consumables undergo monthly cycle counts and quarterly full physical reconciliations.
                All discrepancies above ₹5,000 require Store Manager and Medical Director sign-off. Damaged goods must be quarantined immediately to prevent cross-contamination.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
