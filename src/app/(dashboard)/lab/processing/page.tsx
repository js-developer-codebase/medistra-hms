"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Cpu,
  Search,
  RefreshCw,
  Download,
  Barcode,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Play,
  RotateCcw,
  ArrowRight
} from "lucide-react";

export default function SampleProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <SampleProcessingContent />
    </Suspense>
  );
}

function SampleProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams.get("orderId") || "";
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Sample Collected");

  const loadData = async () => {
    try {
      const res = await fetch("/api/lab/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      toast("Failed to load specimen processing queue", "error");
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

  const handleStartProcessing = async (order: any) => {
    try {
      const res = await fetch(`/api/lab/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Processing",
          receivedInLabAt: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Accession #${order.barcode} accepted into analyzer processing!`, "success");
        loadData();
      } else {
        toast(data.error || "Failed to accept specimen", "error");
      }
    } catch (err) {
      toast("Error accepting specimen", "error");
    }
  };

  const handleRejectSpecimen = async (order: any) => {
    const reason = prompt("Enter clinical reason for specimen rejection (e.g. Clotted sample, Hemolysis, Insufficient volume):");
    if (!reason) return;

    try {
      const res = await fetch(`/api/lab/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Pending", // send back to collection
          sampleCondition: `Rejected: ${reason}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Specimen rejected and returned to Phlebotomy queue for recollection", "warning");
        loadData();
      } else {
        toast(data.error || "Failed to reject specimen", "error");
      }
    } catch (err) {
      toast("Error updating specimen", "error");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const patName = (o.patient?.name || "").toLowerCase();
      const uhid = (o.patient?.uhid || "").toLowerCase();
      const barcode = (o.barcode || "").toLowerCase();

      const matchesSearch = !q || patName.includes(q) || uhid.includes(q) || barcode.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = o.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      toast("No processing records to export", "error");
      return;
    }

    const headers = [
      "Accession Barcode",
      "Collected At",
      "Patient Name",
      "UHID",
      "Specimen Tube",
      "Specimen Condition",
      "Status"
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.barcode || ""}"`,
      `"${o.sampleCollectedAt ? new Date(o.sampleCollectedAt).toLocaleString() : ""}"`,
      `"${o.patient?.name || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      `"${o.sampleType || "Blood"}"`,
      `"${o.sampleCondition || "Adequate"}"`,
      o.status
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sample_Processing_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Processing records exported successfully", "success");
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
            <Cpu className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            Sample Processing & Accessioning
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Laboratory receiving bench, specimen centrifugation, quality evaluation, and automated analyzer accessioning.
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

          <Button
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1.5"
            onClick={() => router.push("/lab/worklist")}
          >
            <span>Bench Worklist</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search accession barcode, patient name, UHID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="Sample Collected">Awaiting Processing (Collected)</option>
                <option value="Processing">Currently Processing</option>
                <option value="ALL">All Specimens</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Bench Accessioning Queue</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} laboratory specimen records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession Barcode</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Specimen Tube</TableHead>
                  <TableHead>Sample Quality</TableHead>
                  <TableHead>Tests Requested</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead className="text-right">Laboratory Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No specimens awaiting bench processing matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((o) => {
                    const isCollected = o.status === "Sample Collected";
                    const isProcessing = o.status === "Processing";
                    return (
                      <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell>
                          <div className="font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Barcode className="h-4 w-4 text-slate-500" />
                            {o.barcode || `LB-${o._id.slice(-6).toUpperCase()}`}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Draw: {o.sampleCollectedAt ? new Date(o.sampleCollectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
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

                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {o.sampleType || "Whole Blood"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`font-semibold ${
                              (o.sampleCondition || "").includes("Rejected")
                                ? "text-rose-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {o.sampleCondition || "Adequate"}
                          </span>
                        </TableCell>

                        <TableCell className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                          {o.tests && o.tests.length > 0
                            ? o.tests.map((t: any) => t.name).join(", ")
                            : "Laboratory Panel"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isProcessing
                                ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            }
                          >
                            {o.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isCollected && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-7 px-2.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1"
                                  onClick={() => handleStartProcessing(o)}
                                >
                                  <Play className="h-3 w-3" />
                                  Accept & Process
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-rose-600 border-rose-300 hover:bg-rose-50"
                                  onClick={() => handleRejectSpecimen(o)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {isProcessing && (
                              <Button
                                size="sm"
                                className="h-7 px-2.5 text-xs bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1"
                                onClick={() => router.push(`/lab/results?orderId=${o._id}`)}
                              >
                                Enter Results
                              </Button>
                            )}
                          </div>
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
    </div>
  );
}
