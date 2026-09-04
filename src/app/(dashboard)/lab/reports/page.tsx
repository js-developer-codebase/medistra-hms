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
  FileText,
  Search,
  RefreshCw,
  Download,
  Barcode,
  Printer,
  Eye,
  CheckCircle2,
  Loader2,
  FlaskConical,
  Award,
  ShieldCheck
} from "lucide-react";

export default function LabReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LabReportsContent />
    </Suspense>
  );
}

function LabReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams.get("orderId") || "";
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  // Print / View Report Modal
  const [reportTarget, setReportTarget] = useState<any>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/lab/orders?status=Completed");
      const data = await res.json();
      if (data.success) {
        const list = data.data || [];
        setOrders(list);

        if (preselectedOrderId) {
          const found = list.find((o: any) => o._id === preselectedOrderId);
          if (found) setReportTarget(found);
        }
      }
    } catch (err) {
      toast("Failed to load completed lab reports", "error");
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
      toast("No completed reports to export", "error");
      return;
    }

    const headers = [
      "Accession Barcode",
      "Report Date",
      "Patient Name",
      "UHID",
      "Verified By",
      "Tests Completed"
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.barcode || ""}"`,
      `"${o.verifiedAt ? new Date(o.verifiedAt).toLocaleDateString() : ""}"`,
      `"${o.patient?.name || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      `"${o.verifiedBy || "Pathologist"}"`,
      `"${(o.tests || []).map((t: any) => t.name).join("; ")}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Completed_Lab_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Reports directory exported successfully", "success");
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
            <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Certified Diagnostic Laboratory Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Official patient diagnostic reports with hospital letterhead, pathologist digital sign-off, and printouts.
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

      {/* Reports Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Certified Reports Directory</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} released diagnostic reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession Barcode</TableHead>
                  <TableHead>Certification Date</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Diagnostic Tests</TableHead>
                  <TableHead>Certified By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12 text-xs">
                      No certified laboratory reports found. Completed and verified test reports will appear here.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((o) => (
                    <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Barcode className="h-4 w-4 text-slate-500" />
                          {o.barcode || `LB-${o._id.slice(-6).toUpperCase()}`}
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-slate-500">
                        {new Date(o.verifiedAt || o.updatedAt).toLocaleDateString()}
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
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                          {o.verifiedBy || "Dr. Pathologist, MD"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 ml-auto"
                          onClick={() => setReportTarget(o)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Official Diagnostic Report Preview Modal */}
      <Dialog open={!!reportTarget} onOpenChange={() => setReportTarget(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {reportTarget && (
            <div className="space-y-6 text-xs bg-white dark:bg-slate-950 p-2">
              {/* Header Letterhead */}
              <div className="border-b pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-6 w-6 text-indigo-600" />
                    <span className="font-extrabold text-lg tracking-wider text-slate-900 dark:text-white">
                      MEDISTRA CLINICAL DIAGNOSTIC LABORATORIES
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ISO 15189:2022 Certified Hospital Diagnostic & Pathology Center • Reg #LAB-90218
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-indigo-600">
                    {reportTarget.barcode}
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300">
                    CERTIFIED REPORT
                  </Badge>
                </div>
              </div>

              {/* Patient & Sample Particulars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Patient Name</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {reportTarget.patient?.name}
                  </div>
                  <div className="text-slate-500 font-mono text-[10px]">UHID: {reportTarget.patient?.uhid}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Age / Gender / Blood</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {reportTarget.patient?.age}y / {reportTarget.patient?.gender}
                  </div>
                  <div className="text-slate-500 text-[10px]">Blood: {reportTarget.patient?.bloodGroup || "Unknown"}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Specimen Details</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {reportTarget.sampleType || "Blood"}
                  </div>
                  <div className="text-slate-500 text-[10px]">Quality: {reportTarget.sampleCondition || "Optimal"}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ordering Doctor</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {reportTarget.doctor?.name ? `Dr. ${reportTarget.doctor.name}` : "Attending Physician"}
                  </div>
                  <div className="text-slate-500 text-[10px]">{new Date(reportTarget.orderDate).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Diagnostic Findings Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100 dark:bg-slate-800">
                      <TableHead className="font-bold text-slate-900 dark:text-white">Investigation Parameter</TableHead>
                      <TableHead className="font-bold text-slate-900 dark:text-white text-center">Observed Result</TableHead>
                      <TableHead className="font-bold text-slate-900 dark:text-white text-center">Reference Interval</TableHead>
                      <TableHead className="font-bold text-slate-900 dark:text-white text-center">Clinical Flag</TableHead>
                      <TableHead className="font-bold text-slate-900 dark:text-white">Technician Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reportTarget.results || []).map((r: any, idx: number) => {
                      const isCritical = r.flag === "Critical";
                      const isAbnormal = r.flag === "High" || r.flag === "Low";
                      return (
                        <TableRow key={idx} className="text-xs">
                          <TableCell className="font-semibold text-slate-900 dark:text-white">
                            {r.test?.name || "Diagnostic Parameter"}
                          </TableCell>

                          <TableCell className="text-center font-mono font-bold text-sm">
                            {r.value} {r.unit}
                          </TableCell>

                          <TableCell className="text-center font-mono text-slate-500">
                            {r.normalRange || r.test?.normalRange || "—"}
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              className={
                                isCritical
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : isAbnormal
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

              {/* Pathologist Sign-off and Certified Footer */}
              <div className="pt-4 border-t flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    Verified & Electronically Authorized
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Timestamp: {reportTarget.verifiedAt ? new Date(reportTarget.verifiedAt).toLocaleString() : new Date().toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    {reportTarget.verifiedBy || "Dr. Arvind Roy, MD"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Consultant Pathologist & Laboratory Director
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between items-center pt-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-1.5">
                  <Printer className="h-4 w-4" />
                  Print Official Report
                </Button>

                <Button variant="outline" size="sm" onClick={() => setReportTarget(null)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
