"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  RefreshCw,
  Search,
  IndianRupee,
  Download,
  Building2,
  PieChart,
  ShieldCheck,
  PackageCheck,
  TrendingUp,
  FileSpreadsheet
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

export default function ProcurementReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"VENDOR" | "DEPT" | "QC">("VENDOR");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/procurement/reports");
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        toast(data.message || "Failed to load procurement reports", "error");
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

  const supplierSpend = reportData?.supplierSpend || {};
  const departmentSpend = reportData?.departmentSpend || {};
  const qcMetrics = reportData?.qcMetrics || {
    totalOrdered: 0,
    totalAccepted: 0,
    totalRejected: 0,
    qcAcceptanceRate: 100
  };

  const totalSupplierSpend = Object.values(supplierSpend).reduce(
    (s: number, sup: any) => s + (sup.totalSpend || 0),
    0
  );

  const filteredSuppliers = Object.entries(supplierSpend).filter(([sup]) =>
    sup.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    if (activeTab === "VENDOR") {
      const headers = ["Vendor Name", "Orders Processed", "Total Spend (INR)", "Spend Share (%)"];
      const rows = Object.entries(supplierSpend).map(([sup, data]: any) => {
        const share = totalSupplierSpend > 0 ? Math.round((data.totalSpend / totalSupplierSpend) * 100) : 0;
        return [`"${sup.replace(/"/g, '""')}"`, data.ordersCount, data.totalSpend, `${share}%`];
      });
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Procurement_Vendor_Spend_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast("Vendor Spend Report exported to CSV", "success");
    } else if (activeTab === "DEPT") {
      const headers = ["Department", "Requisitions Count", "Estimated Spend (INR)"];
      const rows = Object.entries(departmentSpend).map(([dept, data]: any) => [
        `"${dept}"`,
        data.count,
        data.estimatedSpend
      ]);
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Department_Requisitions_Spend_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast("Department Spend Report exported to CSV", "success");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Procurement Reports &amp; Spend Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Spend analysis by vendor and clinical department, QC pass rates, and statutory procurement audit export.
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
            className="text-xs flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV Report
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Contract Spend</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                <IndianRupee className="h-4 w-4 mr-0.5" />
                {totalSupplierSpend.toLocaleString("en-IN")}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">PO commitment sum</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">QC Acceptance Rate</p>
              <h3 className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                {qcMetrics.qcAcceptanceRate}%
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Accepted vs rejected units</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active Suppliers</p>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {reportData?.totalActiveSuppliers || 0}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Hospital approved vendors</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">POs Processed</p>
              <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {reportData?.totalOrdersProcessed || 0}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Lifetime purchase orders</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("VENDOR")}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "VENDOR"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Vendor Spend Analysis
        </button>
        <button
          onClick={() => setActiveTab("DEPT")}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "DEPT"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Departmental Indent Requisitions
        </button>
        <button
          onClick={() => setActiveTab("QC")}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "QC"
              ? "border-rose-600 text-rose-600 dark:text-rose-400"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Delivery &amp; QC Audit Scorecard
        </button>
      </div>

      {/* Tab 1: Vendor Spend */}
      {activeTab === "VENDOR" && (
        <div className="space-y-4">
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search vendor spend..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-rose-600" />
                Supplier Spend Breakdown ({filteredSuppliers.length} vendors)
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Pareto Spend Distribution
              </Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead>Vendor Company Name</TableHead>
                    <TableHead className="text-right">Total Orders</TableHead>
                    <TableHead className="text-right">Committed Spend (₹)</TableHead>
                    <TableHead className="text-center">Spend Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                        No vendor spend recorded yet. Orders will appear here as POs are created.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map(([sup, data]: any) => {
                      const share =
                        totalSupplierSpend > 0
                          ? Math.round((data.totalSpend / totalSupplierSpend) * 100)
                          : 0;

                      return (
                        <TableRow key={sup} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <TableCell className="font-semibold text-slate-900 dark:text-white">
                            {sup}
                          </TableCell>

                          <TableCell className="text-right font-mono text-slate-700 dark:text-slate-300">
                            {data.ordersCount} POs
                          </TableCell>

                          <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                            ₹{(data.totalSpend || 0).toLocaleString("en-IN")}
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs font-mono">
                              {share}% of Total
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

      {/* Tab 2: Department Requisitions */}
      {activeTab === "DEPT" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-600" />
              Department Requisition Commitments
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Clinical Department Spend
            </Badge>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Clinical / Operational Department</TableHead>
                  <TableHead className="text-right">Requisitions Count</TableHead>
                  <TableHead className="text-right">Estimated Indent Budget (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(departmentSpend).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-slate-400">
                      No departmental requisitions logged yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(departmentSpend).map(([dept, data]: any) => (
                    <TableRow key={dept} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {dept}
                      </TableCell>

                      <TableCell className="text-right font-mono text-slate-700 dark:text-slate-300">
                        {data.count} indents
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        ₹{(data.estimatedSpend || 0).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: QC & Delivery Scorecard */}
      {activeTab === "QC" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-teal-600" />
              Dockside Inward QC &amp; Defect Scorecard
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Quality Compliance
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
                <span className="text-xs font-medium text-teal-700 dark:text-teal-300">Total Accepted Units</span>
                <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1 font-mono">
                  {qcMetrics.totalAccepted.toLocaleString("en-IN")}
                </h2>
                <p className="text-[11px] text-teal-600 mt-1">Passed inspection and stocked</p>
              </div>

              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                <span className="text-xs font-medium text-rose-700 dark:text-rose-300">Rejected / Defective Units</span>
                <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
                  {qcMetrics.totalRejected.toLocaleString("en-IN")}
                </h2>
                <p className="text-[11px] text-rose-600 mt-1">Returned to vendor / credit debit</p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Ordered Inward</span>
                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 font-mono">
                  {qcMetrics.totalOrdered.toLocaleString("en-IN")}
                </h2>
                <p className="text-[11px] text-blue-600 mt-1">Consignment manifest units</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border text-xs space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                Procurement Quality Assurance Protocol
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Hospital deliveries require 100% verification against purchase orders.
                Damaged packaging, broken cold-chain seals, or unverified batch certificates result in immediate consignment quarantine and vendor credit notice issuance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
