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
  History,
  Search,
  RefreshCw,
  Download,
  Barcode,
  Eye,
  CheckCircle2,
  Loader2,
  Calendar,
  Clock
} from "lucide-react";

export default function LabHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LabHistoryContent />
    </Suspense>
  );
}

function LabHistoryContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const res = await fetch("/api/lab/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      toast("Failed to load laboratory history archive", "error");
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

  const calculateTAT = (order: any) => {
    if (!order.verifiedAt && !order.updatedAt) return "In Progress";
    const start = new Date(order.orderDate || order.createdAt).getTime();
    const end = new Date(order.verifiedAt || order.updatedAt).getTime();
    const diffMin = Math.round((end - start) / (1000 * 60));
    if (diffMin < 60) return `${diffMin} mins`;
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const patName = (o.patient?.name || "").toLowerCase();
      const uhid = (o.patient?.uhid || "").toLowerCase();
      const barcode = (o.barcode || "").toLowerCase();
      const testNames = (o.tests || []).map((t: any) => t.name.toLowerCase()).join(" ");

      const matchesSearch =
        !q || patName.includes(q) || uhid.includes(q) || barcode.includes(q) || testNames.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = o.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      toast("No records to export", "error");
      return;
    }

    const headers = [
      "Accession Barcode",
      "Order Date",
      "Patient Name",
      "UHID",
      "Tests Completed",
      "Turnaround Time",
      "Final Status",
      "Verified By"
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.barcode || ""}"`,
      `"${new Date(o.orderDate || o.createdAt).toLocaleString()}"`,
      `"${o.patient?.name || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      `"${(o.tests || []).map((t: any) => t.name).join("; ")}"`,
      calculateTAT(o),
      o.status,
      `"${o.verifiedBy || "N/A"}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laboratory_Archive_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Archive exported successfully", "success");
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
            <History className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            Laboratory Archive & Diagnostic History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Comprehensive diagnostic history ledger, turnaround time (TAT) audit trail, and lifetime patient test records.
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
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search barcode, patient name, UHID, test..."
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
                <option value="ALL">All Statuses</option>
                <option value="Completed">Completed Only</option>
                <option value="Processing">Processing</option>
                <option value="Sample Collected">Sample Collected</option>
                <option value="Pending">Pending</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Historical Investigation Ledger</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} lifetime laboratory requisitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession Barcode</TableHead>
                  <TableHead>Order Timestamp</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Tests Conducted</TableHead>
                  <TableHead>Turnaround Time (TAT)</TableHead>
                  <TableHead>Final Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No historical laboratory records found matching criteria.
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
                        {new Date(o.orderDate || o.createdAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short"
                        })}
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

                      <TableCell className="font-mono">
                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {calculateTAT(o)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            o.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : o.status === "Processing"
                              ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }
                        >
                          {o.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        {o.status === "Completed" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50 ml-auto flex items-center gap-1"
                            onClick={() => router.push(`/lab/reports?orderId=${o._id}`)}
                          >
                            <Eye className="h-3 w-3" />
                            Report
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-indigo-600 ml-auto flex items-center gap-1"
                            onClick={() => router.push(`/lab/orders`)}
                          >
                            Track
                          </Button>
                        )}
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
