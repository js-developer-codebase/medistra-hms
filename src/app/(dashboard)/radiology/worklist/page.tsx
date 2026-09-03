"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
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
  ListOrdered,
  Search,
  RefreshCw,
  Download,
  Printer,
  Play,
  CheckCircle2,
  Loader2,
  Scan,
  AlertTriangle,
  Radio,
  Layers
} from "lucide-react";

export default function ModalityWorklistPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ModalityWorklistContent />
    </Suspense>
  );
}

function ModalityWorklistContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");

  const loadData = async () => {
    try {
      // Fetch orders pending scan or in progress
      const res = await fetch("/api/radiology/orders");
      const data = await res.json();
      if (data.success) {
        const list = (data.data || []).filter(
          (o: any) => o.status === "PENDING" || o.status === "SCHEDULED" || o.status === "IN_PROGRESS"
        );
        setOrders(list);
      }
    } catch (err) {
      toast("Failed to load modality worklist", "error");
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

  const handleStartScan = async (order: any) => {
    try {
      const res = await fetch(`/api/radiology/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Acquisition started for ${order.accessionNumber}!`, "success");
        router.push(`/radiology/studies`);
      } else {
        toast(data.message || "Failed to start scan", "error");
      }
    } catch (e) {
      toast("Error starting scan", "error");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const q = search.toLowerCase().trim();
        const patName = (o.patient?.name || "").toLowerCase();
        const uhid = (o.patient?.uhid || "").toLowerCase();
        const accNum = (o.accessionNumber || "").toLowerCase();

        const matchesSearch = !q || patName.includes(q) || uhid.includes(q) || accNum.includes(q);

        let matchesMod = true;
        if (modalityFilter !== "ALL") matchesMod = o.modality === modalityFilter;

        return matchesSearch && matchesMod;
      })
      .sort((a, b) => {
        const weight = (p: string) => (p === "STAT" ? 3 : p === "URGENT" ? 2 : 1);
        return weight(b.priority) - weight(a.priority);
      });
  }, [orders, search, modalityFilter]);

  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      toast("No worklist items to export", "error");
      return;
    }

    const headers = [
      "Accession #",
      "Scheduled Date",
      "Patient Name",
      "UHID",
      "Modality",
      "Procedure",
      "Body Part",
      "Priority",
      "Contrast",
      "Status"
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.accessionNumber || ""}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${o.patient?.name || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      `"${o.modality || "X-RAY"}"`,
      `"${(o.studyType || "").replace(/"/g, '""')}"`,
      `"${o.bodyPart || ""}"`,
      o.priority || "ROUTINE",
      o.contrast ? "Yes" : "No",
      o.status
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Modality_Worklist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Worklist exported successfully", "success");
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
            <ListOrdered className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            DICOM Modality Worklist (MWL)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Technologist scanner acquisition queue sorted by emergency priority, scanner suites, and patient safety checks.
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
            onClick={() => window.print()}
            className="flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            Print Worklist
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
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search accession #, patient name, UHID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Scanner Rooms</option>
                <option value="X-RAY">X-Ray Suite (DR Room 1)</option>
                <option value="CT">CT Suite (128-Slice)</option>
                <option value="MRI">MRI Suite (3.0T High-Field)</option>
                <option value="ULTRASOUND">Ultrasound Suite</option>
                <option value="MAMMOGRAPHY">Mammography Suite</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Worklist Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Scan Acquisition Queue</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} patients queued for scan acquisition across modality suites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession #</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Scanner Suite</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Safety Flags</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Technician Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                      No patients waiting on the scanner worklist.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((o) => (
                    <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          {o.accessionNumber || `RAD-${o._id.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {o.patient?.name || "Patient"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {o.patient?.uhid} • {o.patient?.gender}, {o.patient?.age}y
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.modality === "MRI"
                              ? "bg-purple-100 text-purple-800"
                              : o.modality === "CT"
                              ? "bg-cyan-100 text-cyan-800"
                              : o.modality === "ULTRASOUND"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {o.modality}
                        </Badge>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{o.bodyPart}</span>
                      </TableCell>

                      <TableCell className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                        {o.studyType}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {o.contrast && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[9px] w-fit">
                              IV Contrast
                            </Badge>
                          )}
                          {o.pregnancyStatus === "Positive" && (
                            <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[9px] w-fit">
                              Pregnant
                            </Badge>
                          )}
                          {!o.contrast && o.pregnancyStatus !== "Positive" && (
                            <span className="text-[10px] text-slate-400 font-medium">Clear</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.priority === "STAT"
                              ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse text-[10px]"
                              : o.priority === "URGENT"
                              ? "bg-amber-100 text-amber-800 border-amber-300 text-[10px]"
                              : "bg-slate-100 text-slate-800 text-[10px]"
                          }
                        >
                          {o.priority}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 ml-auto"
                          onClick={() => handleStartScan(o)}
                        >
                          <Play className="h-3 w-3" />
                          Acquire Scan
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
    </div>
  );
}
