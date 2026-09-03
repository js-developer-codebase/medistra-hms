"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  FileCheck2,
  Search,
  RefreshCw,
  Download,
  Barcode,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

export default function ResultEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ResultEntryContent />
    </Suspense>
  );
}

function ResultEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams.get("orderId") || "";
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  // Result Entry Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultRows, setResultRows] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await fetch("/api/lab/orders");
      const data = await res.json();
      if (data.success) {
        const list = data.data || [];
        setOrders(list);

        if (preselectedOrderId) {
          const found = list.find((o: any) => o._id === preselectedOrderId);
          if (found) {
            initOrderResults(found);
          }
        }
      }
    } catch (err) {
      toast("Failed to load result entry orders", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const initOrderResults = (order: any) => {
    setSelectedOrder(order);

    // If order has existing results, use them, otherwise map tests
    if (order.results && order.results.length > 0) {
      setResultRows(
        order.results.map((r: any) => ({
          test: r.test?._id || r.test,
          name: r.test?.name || "Test",
          code: r.test?.code || "",
          value: r.value || "",
          unit: r.unit || "",
          normalRange: r.normalRange || r.test?.normalRange || "",
          flag: r.flag || "Normal",
          remarks: r.remarks || "",
          status: "Entered"
        }))
      );
    } else {
      setResultRows(
        (order.tests || []).map((t: any) => ({
          test: t._id,
          name: t.name,
          code: t.code,
          value: "",
          unit: "",
          normalRange: t.normalRange || "",
          flag: "Normal",
          remarks: "",
          status: "Entered"
        }))
      );
    }
  };

  const handleRowChange = (index: number, field: string, val: string) => {
    setResultRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSubmitting(true);
    try {
      const payload = {
        status: "Processing", // remains in processing until verified
        results: resultRows.map((r) => ({
          test: r.test,
          value: r.value,
          unit: r.unit,
          normalRange: r.normalRange,
          isAbnormal: r.flag !== "Normal",
          flag: r.flag,
          remarks: r.remarks,
          status: "Entered"
        }))
      };

      const res = await fetch(`/api/lab/orders/${selectedOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Diagnostic results entered successfully and queued for pathologist verification!", "success");
        setSelectedOrder(null);
        loadData();
      } else {
        toast(data.error || "Failed to save results", "error");
      }
    } catch (err) {
      toast("Error saving test results", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const patName = (o.patient?.name || "").toLowerCase();
      const uhid = (o.patient?.uhid || "").toLowerCase();
      const barcode = (o.barcode || "").toLowerCase();

      return !q || patName.includes(q) || uhid.includes(q) || barcode.includes(q);
    });
  }, [orders, search]);

  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      toast("No result orders to export", "error");
      return;
    }

    const headers = [
      "Accession Barcode",
      "Order Date",
      "Patient Name",
      "UHID",
      "Tests Count",
      "Results Status",
      "Order Status"
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.barcode || ""}"`,
      `"${new Date(o.orderDate || o.createdAt).toLocaleDateString()}"`,
      `"${o.patient?.name || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      o.tests?.length || 0,
      o.results && o.results.length > 0 ? "Entered" : "Pending Entry",
      o.status
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Lab_Results_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Results ledger exported successfully", "success");
  };

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Diagnostic Result Entry Workstation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter quantitative and qualitative analyzer findings, document abnormal flags, and queue for verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search barcode, patient name, UHID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Laboratory Findings Queue</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession Barcode</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Ordered Tests</TableHead>
                  <TableHead>Specimen Tube</TableHead>
                  <TableHead>Result Status</TableHead>
                  <TableHead>Order Stage</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No orders available for result entry.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((o) => {
                    const hasResults = o.results && o.results.length > 0 && o.results.some((r: any) => r.value);
                    return (
                      <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell>
                          <div className="font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Barcode className="h-4 w-4 text-slate-500" />
                            {o.barcode || `LB-${o._id.slice(-6).toUpperCase()}`}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(o.orderDate || o.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {o.patient?.name || "Patient"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {o.patient?.uhid}
                          </div>
                        </TableCell>

                        <TableCell className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                          {o.tests && o.tests.length > 0
                            ? o.tests.map((t: any) => t.name).join(", ")
                            : "Laboratory Panel"}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {o.sampleType || "Blood"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              hasResults
                                ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }
                          >
                            {hasResults ? "Results Entered" : "Awaiting Results"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {o.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="h-7 px-2.5 text-xs bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1 ml-auto"
                            onClick={() => initOrderResults(o)}
                          >
                            <FileCheck2 className="h-3.5 w-3.5" />
                            {hasResults ? "Edit Values" : "Enter Values"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Result Entry Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <form onSubmit={handleSaveResults}>
              <DialogHeader>
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <FileCheck2 className="h-5 w-5 text-teal-600" />
                      Enter Test Results — {selectedOrder.barcode}
                    </DialogTitle>
                    <DialogDescription>
                      Patient: {selectedOrder.patient?.name} ({selectedOrder.patient?.uhid}) • Priority: {selectedOrder.priority}
                    </DialogDescription>
                  </div>
                  <Badge className="bg-teal-100 text-teal-800 text-xs">
                    {resultRows.length} Tests
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs">
                {resultRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {row.name} ({row.code})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Ref: {row.normalRange || "Standard Reference"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <Label className="text-[10px] text-slate-500 font-semibold">Observed Finding / Value *</Label>
                        <Input
                          placeholder="e.g. 14.2, Negative, 110"
                          value={row.value}
                          onChange={(e) => handleRowChange(idx, "value", e.target.value)}
                          required
                          className="h-8 text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <Label className="text-[10px] text-slate-500 font-semibold">Unit</Label>
                        <Input
                          placeholder="e.g. g/dL, mg/dL"
                          value={row.unit}
                          onChange={(e) => handleRowChange(idx, "unit", e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <Label className="text-[10px] text-slate-500 font-semibold">Clinical Flag</Label>
                        <Select
                          value={row.flag}
                          onChange={(e) => handleRowChange(idx, "flag", e.target.value)}
                          className="h-8 text-xs"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Low">Low (Below Ref)</option>
                          <option value="High">High (Above Ref)</option>
                          <option value="Critical">Critical Alert</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Input
                        placeholder="Technician remarks e.g. Repeated on dilution, verified against control..."
                        value={row.remarks}
                        onChange={(e) => handleRowChange(idx, "remarks", e.target.value)}
                        className="h-7 text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedOrder(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Save & Queue for Verification
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
