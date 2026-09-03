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
  Barcode,
  Printer,
  FileCheck2,
  Loader2,
  CheckCircle2,
  Microscope,
  Cpu
} from "lucide-react";

export default function LabWorklistPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LabWorklistContent />
    </Suspense>
  );
}

function LabWorklistContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const res = await fetch("/api/lab/orders");
      const data = await res.json();
      if (data.success) {
        // Filter to orders that are in processing or collected
        setOrders(
          (data.data || []).filter(
            (o: any) => o.status === "Processing" || o.status === "Sample Collected"
          )
        );
      }
    } catch (err) {
      toast("Failed to load laboratory bench worklist", "error");
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

  // Flatten into individual test items for bench worklist
  const worklistItems = useMemo(() => {
    const items: any[] = [];
    orders.forEach((o) => {
      (o.tests || []).forEach((t: any) => {
        items.push({
          orderId: o._id,
          barcode: o.barcode || `LB-${o._id.slice(-6).toUpperCase()}`,
          patientName: o.patient?.name || "Patient",
          uhid: o.patient?.uhid,
          priority: o.priority,
          sampleType: o.sampleType || "Blood",
          testId: t._id,
          testName: t.name,
          testCode: t.code,
          category: t.category || "General",
          normalRange: t.normalRange,
          status: o.status,
          orderDate: o.orderDate || o.createdAt
        });
      });
    });
    return items;
  }, [orders]);

  const filteredItems = useMemo(() => {
    return worklistItems.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.barcode.toLowerCase().includes(q) ||
        item.patientName.toLowerCase().includes(q) ||
        item.uhid?.toLowerCase().includes(q) ||
        item.testName.toLowerCase().includes(q) ||
        item.testCode.toLowerCase().includes(q);

      let matchesDept = true;
      if (departmentFilter !== "ALL") {
        matchesDept = item.category === departmentFilter;
      }

      return matchesSearch && matchesDept;
    });
  }, [worklistItems, search, departmentFilter]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    worklistItems.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [worklistItems]);

  const exportCSV = () => {
    if (filteredItems.length === 0) {
      toast("No worklist items to export", "error");
      return;
    }

    const headers = [
      "Accession Barcode",
      "Department",
      "Test Code",
      "Test Name",
      "Patient Name",
      "UHID",
      "Priority",
      "Sample Container",
      "Status"
    ];

    const rows = filteredItems.map((i) => [
      `"${i.barcode}"`,
      `"${i.category}"`,
      `"${i.testCode}"`,
      `"${i.testName}"`,
      `"${i.patientName}"`,
      `"${i.uhid || ""}"`,
      i.priority,
      `"${i.sampleType}"`,
      i.status
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Lab_Bench_Worklist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Bench worklist exported successfully", "success");
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
            Laboratory Bench Worklist
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time batch testing queue categorized by diagnostic bench (Hematology, Biochemistry, Microbiology).
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
                placeholder="Search barcode, test code, patient, UHID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Worklist Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Bench Test Queue</CardTitle>
          <CardDescription>
            Showing {filteredItems.length} test procedures currently queued across analyzer benches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession Barcode</TableHead>
                  <TableHead>Bench / Discipline</TableHead>
                  <TableHead>Test Procedure</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Specimen Tube</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No active tests in bench queue matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, idx) => (
                    <TableRow key={idx} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        {item.barcode}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {item.category}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.testName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Code: {item.testCode} • Ref: {item.normalRange || "Standard"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold">{item.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.uhid}</div>
                      </TableCell>

                      <TableCell>
                        <span className="text-slate-600 dark:text-slate-400">{item.sampleType}</span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            item.priority === "STAT"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : item.priority === "Urgent"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }
                        >
                          {item.priority}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 px-2.5 text-xs bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1 ml-auto"
                          onClick={() => router.push(`/lab/results?orderId=${item.orderId}`)}
                        >
                          <FileCheck2 className="h-3.5 w-3.5" />
                          Enter Value
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
