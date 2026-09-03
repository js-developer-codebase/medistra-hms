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
  Clock,
  Search,
  RefreshCw,
  Download,
  TestTube2,
  Zap,
  CheckCircle2,
  Loader2,
  Calendar,
  AlertTriangle
} from "lucide-react";

export default function PendingOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <PendingOrdersContent />
    </Suspense>
  );
}

function PendingOrdersContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const res = await fetch("/api/lab/orders?status=Pending");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      toast("Failed to load pending lab orders", "error");
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
    return orders
      .filter((o) => {
        const q = search.toLowerCase().trim();
        const patName = (o.patient?.name || "").toLowerCase();
        const uhid = (o.patient?.uhid || "").toLowerCase();
        const barcode = (o.barcode || "").toLowerCase();

        const matchesSearch = !q || patName.includes(q) || uhid.includes(q) || barcode.includes(q);

        let matchesPriority = true;
        if (priorityFilter !== "ALL") {
          matchesPriority = o.priority === priorityFilter;
        }

        return matchesSearch && matchesPriority;
      })
      .sort((a, b) => {
        const priorityWeight = (p: string) => (p === "STAT" ? 3 : p === "Urgent" ? 2 : 1);
        return priorityWeight(b.priority) - priorityWeight(a.priority);
      });
  }, [orders, search, priorityFilter]);

  const statCount = useMemo(() => {
    return orders.filter((o) => o.priority === "STAT" || o.priority === "Urgent").length;
  }, [orders]);

  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      toast("No pending orders to export", "error");
      return;
    }

    const headers = [
      "Barcode",
      "Order Time",
      "Patient Name",
      "UHID",
      "Tests Requested",
      "Priority",
      "Specimen Type",
      "Notes"
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.barcode || ""}"`,
      `"${new Date(o.orderDate || o.createdAt).toLocaleString()}"`,
      `"${o.patient?.name || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      `"${(o.tests || []).map((t: any) => t.name).join("; ")}"`,
      o.priority || "Routine",
      `"${o.sampleType || "Blood"}"`,
      `"${(o.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Pending_Lab_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Pending orders exported successfully", "success");
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
            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Pending Laboratory Orders Queue
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Requisitions awaiting specimen drawing, phlebotomy tube selection, and patient identification.
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
            className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
            onClick={() => router.push("/lab/collection")}
          >
            <TestTube2 className="h-4 w-4" />
            Open Phlebotomy Desk
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Awaiting Collection</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {orders.length}
          </span>
          <span className="text-[10px] text-slate-400">Specimen draw required</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">STAT / Urgent Priority</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
            {statCount}
          </span>
          <span className="text-[10px] text-rose-600 font-medium">Immediate collection priority</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Routine Inpatient Panels</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {orders.length - statCount}
          </span>
          <span className="text-[10px] text-slate-400">Scheduled round draws</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search barcode, patient, UHID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Priorities</option>
                <option value="STAT">STAT First</option>
                <option value="Urgent">Urgent</option>
                <option value="Routine">Routine</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Orders Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Pending Specimen Draw Queue</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} requisitions awaiting phlebotomy
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
                  <TableHead>Specimen Tube</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12 text-xs">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                      All laboratory orders have had their specimens collected!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((o) => (
                    <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          {o.barcode || `LB-${o._id.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(o.orderDate || o.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
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

                      <TableCell className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                        {o.tests && o.tests.length > 0
                          ? o.tests.map((t: any) => t.name).join(", ")
                          : "Diagnostic Panel"}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {o.sampleType || "Whole Blood"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.priority === "STAT"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                              : o.priority === "Urgent"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }
                        >
                          {o.priority}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1 ml-auto"
                          onClick={() => router.push(`/lab/collection?orderId=${o._id}`)}
                        >
                          <TestTube2 className="h-3 w-3" />
                          Collect Sample
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
