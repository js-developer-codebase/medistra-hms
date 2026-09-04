"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  History,
  Search,
  Filter,
  Download,
  FileText,
  RefreshCw,
  CheckCircle2,
  Clock,
  Building,
  User,
  AlertTriangle,
  Loader2
} from "lucide-react";

export default function DischargeHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [discharges, setDischarges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchDischarges = async () => {
    try {
      const res = await fetch("/api/admission?status=DISCHARGED");
      const result = await res.json();
      if (res.ok && result.success) {
        setDischarges(result.data || []);
      } else {
        toast(result.message || "Failed to load discharge history", "error");
      }
    } catch (err) {
      toast("An error occurred while loading discharge history", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDischarges();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDischarges();
  };

  const getDurationText = (admissionDate: string, dischargeDate?: string) => {
    if (!admissionDate) return "N/A";
    const start = new Date(admissionDate).getTime();
    const end = dischargeDate ? new Date(dischargeDate).getTime() : Date.now();
    const diffHours = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60)));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    if (days === 0) return `${hours} hrs`;
    return `${days}d ${hours}h`;
  };

  const getConditionBadge = (condition?: string) => {
    switch (condition) {
      case "RECOVERED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300">
            RECOVERED
          </Badge>
        );
      case "IMPROVED":
      case "STABLE":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300">
            {condition}
          </Badge>
        );
      case "TRANSFERRED":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-300">
            TRANSFERRED
          </Badge>
        );
      case "LAMA":
      case "ON_REQUEST":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300">
            {condition}
          </Badge>
        );
      case "DECEASED":
        return (
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300">
            DECEASED
          </Badge>
        );
      default:
        return <Badge variant="outline">{condition || "DISCHARGED"}</Badge>;
    }
  };

  const filteredDischarges = useMemo(() => {
    return discharges.filter((adm) => {
      const q = searchQuery.toLowerCase().trim();
      const patientName = adm.patientId?.name?.toLowerCase() || "";
      const uhid = adm.patientId?.uhid?.toLowerCase() || "";
      const contact = adm.patientId?.contact || "";
      const bedNumber = adm.bedId?.bedNumber?.toLowerCase() || "";
      const doctorName = adm.doctorId?.name?.toLowerCase() || "";
      const diagnosis = adm.finalDiagnosis?.toLowerCase() || "";

      const matchesSearch =
        !q ||
        patientName.includes(q) ||
        uhid.includes(q) ||
        contact.includes(q) ||
        bedNumber.includes(q) ||
        doctorName.includes(q) ||
        diagnosis.includes(q);

      const matchesCondition =
        conditionFilter === "ALL" || adm.dischargeCondition === conditionFilter;

      let matchesDate = true;
      if (startDate && adm.dischargeDate) {
        matchesDate = matchesDate && new Date(adm.dischargeDate) >= new Date(startDate);
      }
      if (endDate && adm.dischargeDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(adm.dischargeDate) <= end;
      }

      return matchesSearch && matchesCondition && matchesDate;
    });
  }, [discharges, searchQuery, conditionFilter, startDate, endDate]);

  const kpis = useMemo(() => {
    const total = discharges.length;
    const recovered = discharges.filter(
      (d) => d.dischargeCondition === "RECOVERED" || d.dischargeCondition === "IMPROVED"
    ).length;
    const recoveredRate = total > 0 ? Math.round((recovered / total) * 100) : 0;

    let totalStayMs = 0;
    let stayCount = 0;
    discharges.forEach((d) => {
      if (d.admissionDate && d.dischargeDate) {
        const diff = new Date(d.dischargeDate).getTime() - new Date(d.admissionDate).getTime();
        if (diff > 0) {
          totalStayMs += diff;
          stayCount++;
        }
      }
    });
    const avgStayDays =
      stayCount > 0 ? (totalStayMs / (stayCount * 1000 * 60 * 60 * 24)).toFixed(1) : "0";

    const specialCases = discharges.filter(
      (d) => d.dischargeCondition === "LAMA" || d.dischargeCondition === "TRANSFERRED"
    ).length;

    return { total, recoveredRate, avgStayDays, specialCases };
  }, [discharges]);

  const exportCSV = () => {
    if (filteredDischarges.length === 0) {
      toast("No records to export", "error");
      return;
    }

    const headers = [
      "UHID",
      "Patient Name",
      "Age",
      "Gender",
      "Admission Date",
      "Discharge Date",
      "Length of Stay",
      "Vacated Bed",
      "Attending Doctor",
      "Final Diagnosis",
      "Discharge Condition",
      "Follow-up Date"
    ];

    const rows = filteredDischarges.map((d) => [
      `"${d.patientId?.uhid || ""}"`,
      `"${d.patientId?.name || ""}"`,
      d.patientId?.age || "",
      d.patientId?.gender || "",
      `"${new Date(d.admissionDate).toLocaleDateString()}"`,
      `"${d.dischargeDate ? new Date(d.dischargeDate).toLocaleDateString() : ""}"`,
      `"${getDurationText(d.admissionDate, d.dischargeDate)}"`,
      `"${d.bedId?.bedNumber || ""}"`,
      `"Dr. ${d.doctorId?.name || ""}"`,
      `"${(d.finalDiagnosis || "").replace(/"/g, '""')}"`,
      d.dischargeCondition || "",
      d.followUpDate ? `"${new Date(d.followUpDate).toLocaleDateString()}"` : "None"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Discharge_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Discharge history exported successfully", "success");
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
            <History className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Discharge History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Historical audit log of all completed patient discharges, clinical outcomes, and summaries.
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

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Discharged
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {kpis.total}
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <History className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Recovery / Improved Rate
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {kpis.recoveredRate}%
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Average Length of Stay
            </div>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {kpis.avgStayDays} days
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Transferred / LAMA
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {kpis.specialCases}
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient, UHID, bed, doctor, diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div>
              <Select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="w-full"
              >
                <option value="ALL">All Discharge Conditions</option>
                <option value="RECOVERED">Recovered</option>
                <option value="IMPROVED">Improved</option>
                <option value="STABLE">Stable</option>
                <option value="TRANSFERRED">Transferred</option>
                <option value="LAMA">LAMA</option>
                <option value="DECEASED">Deceased</option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">From:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 whitespace-nowrap">To Date:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs w-44"
              />
            </div>

            {(searchQuery || conditionFilter !== "ALL" || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setConditionFilter("ALL");
                  setStartDate("");
                  setEndDate("");
                }}
                className="h-8 text-xs text-slate-500 hover:text-slate-800"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Discharges Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Discharge Archive</CardTitle>
          <CardDescription>
            Showing {filteredDischarges.length} of {discharges.length} discharge records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Discharge Date</TableHead>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Stay Duration</TableHead>
                  <TableHead>Bed Vacated</TableHead>
                  <TableHead>Final Diagnosis</TableHead>
                  <TableHead>Outcome Condition</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDischarges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-12 text-xs">
                      No discharge records match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDischarges.map((adm) => (
                    <TableRow key={adm._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      {/* Discharge Date */}
                      <TableCell className="font-medium">
                        {adm.dischargeDate ? new Date(adm.dischargeDate).toLocaleDateString() : "N/A"}
                        <div className="text-[10px] text-slate-400">
                          {adm.dischargeDate
                            ? new Date(adm.dischargeDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : ""}
                        </div>
                      </TableCell>

                      {/* Patient */}
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {adm.patientId?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {adm.patientId?.uhid || adm.patientId?.contact}
                        </div>
                      </TableCell>

                      {/* Duration */}
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {getDurationText(adm.admissionDate, adm.dischargeDate)}
                        </Badge>
                      </TableCell>

                      {/* Bed Vacated */}
                      <TableCell>
                        <div className="font-medium">Bed {adm.bedId?.bedNumber || "N/A"}</div>
                        <div className="text-[10px] text-slate-400">
                          {adm.bedId?.roomId?.wardId?.wardName || "General"}
                        </div>
                      </TableCell>

                      {/* Final Diagnosis */}
                      <TableCell className="max-w-[160px] truncate" title={adm.finalDiagnosis}>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {adm.finalDiagnosis || adm.initialDiagnosis || "Unspecified"}
                        </span>
                      </TableCell>

                      {/* Outcome Condition */}
                      <TableCell>{getConditionBadge(adm.dischargeCondition)}</TableCell>

                      {/* Doctor */}
                      <TableCell>
                        <div className="font-medium">Dr. {adm.doctorId?.name || "Attending"}</div>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-xs flex items-center gap-1 ml-auto text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          onClick={() => router.push(`/admissions/summary?id=${adm._id}`)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Summary
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
