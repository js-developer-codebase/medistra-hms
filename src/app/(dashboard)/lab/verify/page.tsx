"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Barcode,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Eye,
  FileText
} from "lucide-react";

export default function ResultVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ResultVerificationContent />
    </Suspense>
  );
}

function ResultVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams.get("orderId") || "";
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  // Verification Review Modal
  const [verifyTarget, setVerifyTarget] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch("/api/lab/orders");
      const data = await res.json();
      if (data.success) {
        const list = data.data || [];
        setOrders(list);

        if (preselectedOrderId) {
          const found = list.find((o: any) => o._id === preselectedOrderId);
          if (found) setVerifyTarget(found);
        }
      }
    } catch (err) {
      toast("Failed to load verification queue", "error");
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

  const handleApproveVerification = async (order: any) => {
    setSubmitting(true);
    try {
      const updatedResults = (order.results || []).map((r: any) => ({
        ...r,
        test: r.test?._id || r.test,
        status: "Verified"
      }));

      const payload = {
        status: "Completed",
        verifiedAt: new Date().toISOString(),
        verifiedBy: "Dr. Arvind Roy, MD (Pathology)",
        results: updatedResults
      };

      const res = await fetch(`/api/lab/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Diagnostic report for ${order.patient?.name} certified and verified!`, "success");
        setVerifyTarget(null);
        loadData();
      } else {
        toast(data.error || "Failed to verify report", "error");
      }
    } catch (err) {
      toast("Error certifying report", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestRetest = async (order: any) => {
    if (!confirm("Reject results and send specimen back to analyzer bench for re-testing?")) return;

    try {
      const res = await fetch(`/api/lab/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: `${order.notes || ""} [Retest requested by Pathologist]`,
          status: "Processing"
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Specimen returned to bench for re-analysis", "warning");
        setVerifyTarget(null);
        loadData();
      }
    } catch (err) {
      toast("Error requesting retest", "error");
    }
  };

  // Orders that have entered results
  const verificationQueue = useMemo(() => {
    return orders.filter((o) => {
      const hasResults = o.results && o.results.length > 0 && o.results.some((r: any) => r.value);
      const isUnverified = o.status !== "Completed" && o.status !== "Cancelled";

      const q = search.toLowerCase().trim();
      const patName = (o.patient?.name || "").toLowerCase();
      const uhid = (o.patient?.uhid || "").toLowerCase();
      const barcode = (o.barcode || "").toLowerCase();

      const matchesSearch = !q || patName.includes(q) || uhid.includes(q) || barcode.includes(q);

      return hasResults && isUnverified && matchesSearch;
    });
  }, [orders, search]);

  const exportCSV = () => {
    if (verificationQueue.length === 0) {
      toast("No orders to export", "error");
      return;
    }

    const headers = [
      "Accession Barcode",
      "Order Date",
      "Patient Name",
      "UHID",
      "Tests Count",
      "Priority"
    ];

    const rows = verificationQueue.map((o) => [
      `"${o.barcode || ""}"`,
      `"${new Date(o.orderDate || o.createdAt).toLocaleDateString()}"`,
      `"${o.patient?.name || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      o.tests?.length || 0,
      o.priority
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Verification_Queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Verification queue exported successfully", "success");
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
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Pathologist Result Verification & Approval
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quality assurance desk: review observed parameters against delta standards, authorize certified laboratory releases.
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

      {/* Verification Queue Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Awaiting Pathologist Verification</CardTitle>
          <CardDescription>
            Showing {verificationQueue.length} laboratory test requisitions with entered findings awaiting sign-off
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession Barcode</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Requested Tests</TableHead>
                  <TableHead>Observed Findings</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Verification Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verificationQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12 text-xs">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                      All entered results have been verified and certified.
                    </TableCell>
                  </TableRow>
                ) : (
                  verificationQueue.map((o) => {
                    const hasAbnormal = (o.results || []).some((r: any) => r.isAbnormal || r.flag !== "Normal");
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
                          {hasAbnormal ? (
                            <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px] flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" />
                              Abnormal Values
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                              Within Normal Limits
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              o.priority === "STAT"
                                ? "bg-rose-100 text-rose-800"
                                : o.priority === "Urgent"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-800"
                            }
                          >
                            {o.priority}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 ml-auto"
                            onClick={() => setVerifyTarget(o)}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Review & Certify
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

      {/* Review & Certify Modal */}
      <Dialog open={!!verifyTarget} onOpenChange={() => setVerifyTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {verifyTarget && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      Certify Diagnostic Report — {verifyTarget.barcode}
                    </DialogTitle>
                    <DialogDescription>
                      Patient: {verifyTarget.patient?.name} ({verifyTarget.patient?.uhid}) • Age: {verifyTarget.patient?.age}y ({verifyTarget.patient?.gender})
                    </DialogDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                    Quality Review
                  </Badge>
                </div>
              </DialogHeader>

              {/* Observed Findings Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Parameter</TableHead>
                      <TableHead>Observed Finding</TableHead>
                      <TableHead>Reference Interval</TableHead>
                      <TableHead>Flag</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(verifyTarget.results || []).map((r: any, idx: number) => {
                      const isCritical = r.flag === "Critical";
                      const isHigh = r.flag === "High";
                      const isLow = r.flag === "Low";
                      return (
                        <TableRow key={idx} className="text-xs">
                          <TableCell className="font-semibold text-slate-900 dark:text-white">
                            {r.test?.name || "Test Parameter"}
                          </TableCell>

                          <TableCell className="font-bold font-mono text-sm">
                            {r.value} {r.unit}
                          </TableCell>

                          <TableCell className="font-mono text-slate-500">
                            {r.normalRange || r.test?.normalRange || "—"}
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={
                                isCritical
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : isHigh || isLow
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-emerald-100 text-emerald-800 border-emerald-300"
                              }
                            >
                              {r.flag || "Normal"}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-slate-500">
                            {r.remarks || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pathologist Digital Sign-off Banner */}
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900 dark:text-emerald-100">
                    Dr. Arvind Roy, MD (Pathology)
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300">
                    Chief Pathologist & Quality Assurance Director • Reg #MC-93821
                  </div>
                </div>
                <Badge variant="outline" className="text-emerald-700 border-emerald-300 text-[10px]">
                  Electronic Signature Ready
                </Badge>
              </div>

              <DialogFooter className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-rose-600 border-rose-300 hover:bg-rose-50"
                  onClick={() => handleRequestRetest(verifyTarget)}
                  disabled={submitting}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Order Retest
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setVerifyTarget(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                    onClick={() => handleApproveVerification(verifyTarget)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Certifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Authorize & Release Report
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
