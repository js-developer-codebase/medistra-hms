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
  Images,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  Loader2,
  Scan
} from "lucide-react";

export default function ImagingHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ImagingHistoryContent />
    </Suspense>
  );
}

function ImagingHistoryContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const res = await fetch("/api/radiology/studies");
      const data = await res.json();
      if (data.success) {
        setStudies(data.data || []);
      }
    } catch (e) {
      toast("Failed to load imaging history", "error");
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

  const filteredStudies = useMemo(() => {
    return studies.filter((s) => {
      const q = search.toLowerCase().trim();
      const patName = (s.patient?.name || "").toLowerCase();
      const uhid = (s.patient?.uhid || "").toLowerCase();
      const accNum = (s.accessionNumber || "").toLowerCase();
      const impression = (s.impression || "").toLowerCase();

      const matchesSearch =
        !q || patName.includes(q) || uhid.includes(q) || accNum.includes(q) || impression.includes(q);

      let matchesMod = true;
      if (modalityFilter !== "ALL") matchesMod = s.modality === modalityFilter;

      let matchesTime = true;
      if (timeFilter !== "ALL") {
        const studyDate = new Date(s.createdAt).getTime();
        const now = Date.now();
        if (timeFilter === "TODAY") {
          matchesTime = now - studyDate < 24 * 60 * 60 * 1000;
        } else if (timeFilter === "7DAYS") {
          matchesTime = now - studyDate < 7 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === "30DAYS") {
          matchesTime = now - studyDate < 30 * 24 * 60 * 60 * 1000;
        }
      }

      return matchesSearch && matchesMod && matchesTime;
    });
  }, [studies, search, modalityFilter, timeFilter]);

  const calculateTAT = (study: any) => {
    if (!study.verifiedAt || !study.createdAt) return "—";
    const diffMs = new Date(study.verifiedAt).getTime() - new Date(study.createdAt).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs > 0 ? `${diffHrs}h ` : ""}${diffMins}m`;
  };

  const exportCSV = () => {
    if (filteredStudies.length === 0) {
      toast("No records to export", "error");
      return;
    }

    const headers = [
      "Accession #",
      "Study Date",
      "Patient Name",
      "UHID",
      "Modality",
      "Anatomic Region",
      "Impression",
      "Verified By",
      "TAT Duration",
      "Status"
    ];

    const rows = filteredStudies.map((s) => [
      `"${s.accessionNumber || ""}"`,
      `"${new Date(s.createdAt).toLocaleDateString()}"`,
      `"${s.patient?.name || ""}"`,
      `"${s.patient?.uhid || ""}"`,
      `"${s.modality || "X-RAY"}"`,
      `"${s.bodyPart || ""}"`,
      `"${(s.impression || "").replace(/"/g, '""')}"`,
      `"${s.verifiedBy || ""}"`,
      calculateTAT(s),
      s.status
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Radiology_History_Archive_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("History archive exported successfully", "success");
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
            Diagnostic Imaging History & PACS Archive
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Patient longitudinal imaging repository, turnaround times (TAT), and historical modality comparison.
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
            Export Archive CSV
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
                placeholder="Search accession #, patient name, UHID, diagnostic findings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Modalities</option>
                <option value="X-RAY">X-Ray (Digital)</option>
                <option value="CT">Computed Tomography (CT)</option>
                <option value="MRI">Magnetic Resonance (MRI)</option>
                <option value="ULTRASOUND">Ultrasound (USG)</option>
                <option value="MAMMOGRAPHY">Mammography</option>
              </Select>
            </div>

            <div className="w-full sm:w-44">
              <Select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Last 24 Hours</option>
                <option value="7DAYS">Last 7 Days</option>
                <option value="30DAYS">Last 30 Days</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Archive Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">PACS Archival Ledger</CardTitle>
          <CardDescription>
            Showing {filteredStudies.length} of {studies.length} diagnostic records in repository
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession # / Date</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Modality & Region</TableHead>
                  <TableHead>Diagnostic Impression</TableHead>
                  <TableHead>Signatory</TableHead>
                  <TableHead>TAT</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No historical imaging records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudies.map((s) => (
                    <TableRow key={s._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {s.accessionNumber || `RAD-${s._id.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {s.patient?.name || "Patient"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.patient?.uhid}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {s.modality || "X-RAY"}
                        </Badge>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{s.bodyPart || "Chest"}</span>
                      </TableCell>

                      <TableCell className="max-w-xs truncate text-slate-700 dark:text-slate-300 font-medium">
                        {s.impression || "Awaiting reporting..."}
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-400 text-[11px]">
                        {s.verifiedBy || "Pending"}
                      </TableCell>

                      <TableCell className="font-mono text-[11px] text-slate-500">
                        {calculateTAT(s)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                            onClick={() => router.push(`/radiology/images?studyId=${s._id}`)}
                          >
                            <Images className="h-3 w-3 mr-1" />
                            PACS
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => router.push(`/radiology/imaging-reports?studyId=${s._id}`)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Report
                          </Button>
                        </div>
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
