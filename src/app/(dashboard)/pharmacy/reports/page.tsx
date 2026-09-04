"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  Printer,
  Download,
  Calendar,
  IndianRupee,
  ShoppingCart,
  RotateCcw,
  Boxes,
  ShieldAlert,
  Clock,
  RefreshCw
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

export default function PharmacyReportsPage() {
  const [dispenses, setDispenses] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [reportTab, setReportTab] = useState<"SALES" | "VALUATION" | "NARCOTICS" | "RETURNS">("SALES");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [dispRes, medRes, retRes] = await Promise.all([
        fetch("/api/pharmacy/dispense"),
        fetch("/api/pharmacy/medicines"),
        fetch("/api/pharmacy/returns")
      ]);

      const dData = await dispRes.json();
      if (dData.success) setDispenses(dData.data || []);

      const mData = await medRes.json();
      if (mData.success) setMedicines(mData.data || []);

      const rData = await retRes.json();
      if (rData.success) setReturns(rData.data || []);
    } catch (err) {
      toast("Failed to load pharmacy reporting metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregates
  const totalRevenue = useMemo(() => {
    return dispenses.reduce((acc, d) => acc + (d.totalAmount || 0), 0);
  }, [dispenses]);

  const totalGstCollected = useMemo(() => {
    return dispenses.reduce((acc, d) => acc + (d.taxAmount || 0), 0);
  }, [dispenses]);

  const totalStockValuation = useMemo(() => {
    return medicines.reduce((acc, m) => acc + (m.stockQuantity || 0) * (m.unitPrice || 0), 0);
  }, [medicines]);

  const totalRefunds = useMemo(() => {
    return returns.reduce((acc, r) => acc + (r.totalRefund || 0), 0);
  }, [returns]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {
      CASH: { count: 0, total: 0 },
      UPI: { count: 0, total: 0 },
      CARD: { count: 0, total: 0 },
      CREDIT_HOSPITAL: { count: 0, total: 0 }
    };

    for (const d of dispenses) {
      const mode = d.paymentMode || "CASH";
      if (!map[mode]) map[mode] = { count: 0, total: 0 };
      map[mode].count += 1;
      map[mode].total += d.totalAmount || 0;
    }

    return map;
  }, [dispenses]);

  // Controlled / Schedule H1 substances
  const controlledMeds = useMemo(() => {
    return medicines.filter((m) => m.category === "Controlled Substances");
  }, [medicines]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `pharmacy_report_${reportTab.toLowerCase()}_${Date.now()}.csv`;

    if (reportTab === "SALES") {
      headers = ["Bill Number", "Date", "Patient Name", "Payment Mode", "Subtotal (INR)", "Tax (INR)", "Total (INR)"];
      rows = dispenses.map((d) => [
        `"${d.billNumber}"`,
        new Date(d.createdAt).toLocaleDateString(),
        `"${d.patientName}"`,
        d.paymentMode,
        d.subtotal || 0,
        d.taxAmount || 0,
        d.totalAmount || 0
      ]);
    } else if (reportTab === "VALUATION") {
      headers = ["Medicine Name", "Category", "Batch", "Unit Price (INR)", "Stock Balance", "Valuation (INR)"];
      rows = medicines.map((m) => [
        `"${m.name}"`,
        `"${m.category}"`,
        m.batchNumber || "",
        m.unitPrice || 0,
        m.stockQuantity || 0,
        (m.stockQuantity || 0) * (m.unitPrice || 0)
      ]);
    } else if (reportTab === "RETURNS") {
      headers = ["Return Voucher #", "Date", "Patient Name", "Reason", "Condition", "Refund Amount (INR)"];
      rows = returns.map((r) => [
        `"${r.returnNumber}"`,
        new Date(r.createdAt).toLocaleDateString(),
        `"${r.patientName}"`,
        r.reason,
        r.items?.[0]?.condition || "INTACT",
        r.totalRefund || 0
      ]);
    } else {
      headers = ["Drug Name", "Batch", "Rack Location", "Current Vault Stock", "Unit Price (INR)"];
      rows = controlledMeds.map((m) => [
        `"${m.name}"`,
        m.batchNumber || "",
        `"${m.rackLocation || ""}"`,
        m.stockQuantity || 0,
        m.unitPrice || 0
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Report exported to CSV", "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Pharmacy Financial &amp; Audit Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dispensing revenue turnover in ₹, GST liability, controlled substances ledger, and return wastage audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Gross Dispense Revenue
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-slate-500">{dispenses.length} total bills</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              GST Tax Remittance
              <IndianRupee className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              ₹{Math.round(totalGstCollected).toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-slate-500">Collected tax</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Stock Valuation
              <Boxes className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{totalStockValuation.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-slate-500">{medicines.length} formulations</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Returns &amp; Refunds
              <RotateCcw className="h-4 w-4 text-rose-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              ₹{totalRefunds.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-slate-500">{returns.length} return claims</p>
          </CardContent>
        </Card>
      </div>

      {/* Report View Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit text-xs">
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs ${reportTab === "SALES" ? "bg-white dark:bg-slate-900 shadow-sm font-semibold text-emerald-600" : "text-slate-600"}`}
          onClick={() => setReportTab("SALES")}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Sales &amp; Revenue
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs ${reportTab === "VALUATION" ? "bg-white dark:bg-slate-900 shadow-sm font-semibold text-emerald-600" : "text-slate-600"}`}
          onClick={() => setReportTab("VALUATION")}
        >
          <Boxes className="h-3.5 w-3.5 mr-1" /> Inventory Valuation
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs ${reportTab === "NARCOTICS" ? "bg-white dark:bg-slate-900 shadow-sm font-semibold text-emerald-600" : "text-slate-600"}`}
          onClick={() => setReportTab("NARCOTICS")}
        >
          <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Controlled Vault
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs ${reportTab === "RETURNS" ? "bg-white dark:bg-slate-900 shadow-sm font-semibold text-emerald-600" : "text-slate-600"}`}
          onClick={() => setReportTab("RETURNS")}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Returns &amp; Wastage
        </Button>
      </div>

      {/* Tab 1: Sales & Revenue Breakdown */}
      {reportTab === "SALES" && (
        <div className="space-y-4">
          {/* Payment Method Channels */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(paymentBreakdown).map(([mode, data]) => (
              <Card key={mode} className="border shadow-sm bg-white dark:bg-slate-900">
                <CardContent className="p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {mode.replace(/_/g, " ")}
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    ₹{data.total.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-slate-500">{data.count} transactions</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-emerald-600" />
                Dispensed Invoices Ledger ({dispenses.length} Records)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Date &amp; Time</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Tax (GST)</TableHead>
                    <TableHead className="text-right">Total (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                        No dispensing transactions recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    dispenses.map((d) => (
                      <TableRow key={d._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                          {d.billNumber}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {new Date(d.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {d.patientName}
                          </div>
                          {d.uhid && <div className="text-[10px] text-slate-400 font-mono">UHID: {d.uhid}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {d.paymentMode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">₹{d.subtotal || 0}</TableCell>
                        <TableCell className="text-right font-mono text-slate-500">
                          ₹{d.taxAmount || 0}
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          ₹{(d.totalAmount || 0).toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Inventory Valuation */}
      {reportTab === "VALUATION" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Boxes className="h-4 w-4 text-emerald-600" />
              Inventory Valuation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Stock Quantity</TableHead>
                  <TableHead className="text-right">Total Valuation (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((m) => {
                  const val = (m.stockQuantity || 0) * (m.unitPrice || 0);
                  return (
                    <TableRow key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {m.name}
                      </TableCell>
                      <TableCell>{m.category}</TableCell>
                      <TableCell className="font-mono text-slate-500">{m.batchNumber || "N/A"}</TableCell>
                      <TableCell className="text-right font-mono">₹{m.unitPrice}</TableCell>
                      <TableCell className="text-right font-bold">{m.stockQuantity}</TableCell>
                      <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                        ₹{val.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Controlled Vault */}
      {reportTab === "NARCOTICS" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
              Controlled Substances &amp; Schedule H1 Narcotics Vault Audit
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Drug Name</TableHead>
                  <TableHead>Generic Molecule</TableHead>
                  <TableHead>Batch Serial</TableHead>
                  <TableHead>Vault Location</TableHead>
                  <TableHead className="text-right">Vault Stock Balance</TableHead>
                  <TableHead className="text-right">Unit Price (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {controlledMeds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      No Schedule H1 controlled substances registered in vault.
                    </TableCell>
                  </TableRow>
                ) : (
                  controlledMeds.map((m) => (
                    <TableRow key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-bold text-rose-700 dark:text-rose-400">
                        {m.name}
                      </TableCell>
                      <TableCell>{m.genericName || "Controlled Opioid"}</TableCell>
                      <TableCell className="font-mono">{m.batchNumber}</TableCell>
                      <TableCell className="font-mono text-slate-600 dark:text-slate-300">
                        {m.rackLocation || "Vault Locker"}
                      </TableCell>
                      <TableCell className="text-right font-bold">{m.stockQuantity} Units</TableCell>
                      <TableCell className="text-right font-mono">₹{m.unitPrice}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Returns & Wastage */}
      {reportTab === "RETURNS" && (
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-emerald-600" />
              Medication Returns &amp; Restock History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Return Voucher</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead className="text-right">Refund Total (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      No medication returns recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  returns.map((r) => (
                    <TableRow key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        {r.returnNumber}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{r.patientName}</TableCell>
                      <TableCell>{r.reason?.replace(/_/g, " ")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={r.items?.[0]?.condition === "INTACT_RESTOCKABLE" ? "outline" : "destructive"}
                          className="text-[10px]"
                        >
                          {r.items?.[0]?.condition === "INTACT_RESTOCKABLE" ? "Restocked" : "Discarded"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">
                        ₹{(r.totalRefund || 0).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
