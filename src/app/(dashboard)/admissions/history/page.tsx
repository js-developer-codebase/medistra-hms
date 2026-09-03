"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  FileText,
  Calendar,
  Bed,
  CheckCircle2,
  Users,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function AdmissionHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Details Modal
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/admission");
      const result = await res.json();
      if (res.ok && result.success) {
        setAdmissions(result.data || []);
      } else {
        toast(result.message || "Failed to load admission history", "error");
      }
    } catch (err) {
      toast("An error occurred while loading admission history", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const getDurationText = (admissionDate: string, dischargeDate?: string) => {
    const start = new Date(admissionDate).getTime();
    const end = dischargeDate ? new Date(dischargeDate).getTime() : Date.now();
    const diffHours = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60)));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    if (days === 0) return `${hours} hrs`;
    return `${days}d ${hours}h`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISCHARGED":
        return <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">DISCHARGED</Badge>;
      case "ADMITTED":
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300">ADMITTED</Badge>;
      case "TRANSFERRED":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300">TRANSFERRED</Badge>;
      case "CANCELLED":
        return <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((adm) => {
      const q = searchQuery.toLowerCase().trim();
      const patientName = adm.patientId?.name?.toLowerCase() || "";
      const uhid = adm.patientId?.uhid?.toLowerCase() || "";
      const contact = adm.patientId?.contact || "";
      const bedNumber = adm.bedId?.bedNumber?.toLowerCase() || "";
      const doctorName = adm.doctorId?.name?.toLowerCase() || "";

      const matchesSearch =
        !q ||
        patientName.includes(q) ||
        uhid.includes(q) ||
        contact.includes(q) ||
        bedNumber.includes(q) ||
        doctorName.includes(q);

      const matchesStatus = statusFilter === "ALL" || adm.status === statusFilter;
      const matchesType = typeFilter === "ALL" || adm.admissionType === typeFilter;

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(adm.admissionDate) >= new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(adm.admissionDate) <= end;
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [admissions, searchQuery, statusFilter, typeFilter, startDate, endDate]);

  const kpis = useMemo(() => {
    const total = admissions.length;
    const discharged = admissions.filter((a) => a.status === "DISCHARGED").length;
    const active = admissions.filter((a) => a.status === "ADMITTED" || a.status === "TRANSFERRED").length;

    let totalStayMs = 0;
    let stayCount = 0;
    admissions
      .filter((a) => a.status === "DISCHARGED" && a.dischargeDate)
      .forEach((a) => {
        const diff = new Date(a.dischargeDate).getTime() - new Date(a.admissionDate).getTime();
        if (diff > 0) {
          totalStayMs += diff;
          stayCount++;
        }
      });
    const avgStayDays = stayCount > 0 ? (totalStayMs / (stayCount * 1000 * 60 * 60 * 24)).toFixed(1) : "0";

    return { total, discharged, active, avgStayDays };
  }, [admissions]);

  const exportCSV = () => {
    if (filteredAdmissions.length === 0) {
      toast("No records to export", "error");
      return;
    }

    const headers = [
      "UHID",
      "Patient Name",
      "Age",
      "Gender",
      "Contact",
      "Admission Date",
      "Discharge Date",
      "Length of Stay",
      "Ward",
      "Bed",
      "Doctor",
      "Admission Type",
      "Status",
      "Discharge Condition"
    ];

    const rows = filteredAdmissions.map((a) => [
      `"${a.patientId?.uhid || ""}"`,
      `"${a.patientId?.name || ""}"`,
      a.patientId?.age || "",
      a.patientId?.gender || "",
      `"${a.patientId?.contact || ""}"`,
      `"${new Date(a.admissionDate).toLocaleString()}"`,
      a.dischargeDate ? `"${new Date(a.dischargeDate).toLocaleString()}"` : "Still Admitted",
      `"${getDurationText(a.admissionDate, a.dischargeDate)}"`,
      `"${a.bedId?.roomId?.wardId?.wardName || ""}"`,
      `"${a.bedId?.bedNumber || ""}"`,
      `"Dr. ${a.doctorId?.name || ""}"`,
      a.admissionType || "",
      a.status || "",
      a.dischargeCondition || ""
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Admission_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Admission history exported successfully", "success");
  };

  const openDetails = (adm: any) => {
    setSelectedAdmission(adm);
    setDetailsOpen(true);
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
            <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Admission History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Comprehensive historical archive and audit trail of all hospital inpatient admissions.
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
              Total Admissions
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {kpis.total}
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Discharged Patients
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {kpis.discharged}
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Inpatients
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {kpis.active}
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Bed className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Avg Stay (ALOS)
            </div>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {kpis.avgStayDays} days
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient, UHID, bed, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="DISCHARGED">Discharged</option>
                <option value="ADMITTED">Admitted</option>
                <option value="TRANSFERRED">Transferred</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>

            <div>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full"
              >
                <option value="ALL">All Types</option>
                <option value="ELECTIVE">Elective</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="TRANSFER">Transfer</option>
                <option value="DAYCARE">Daycare</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 whitespace-nowrap">From Date:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 whitespace-nowrap">To Date:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8"
              />
            </div>

            <div className="flex items-center justify-end">
              {(searchQuery || statusFilter !== "ALL" || typeFilter !== "ALL" || startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setTypeFilter("ALL");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="h-8 text-xs text-slate-500 hover:text-slate-800"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Admission Ledger</CardTitle>
          <CardDescription>
            Showing {filteredAdmissions.length} of {admissions.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Discharge Date</TableHead>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Ward & Bed</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-12">
                      No admission records match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmissions.map((adm) => (
                    <TableRow key={adm._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 text-xs">
                      {/* Admission Date */}
                      <TableCell className="font-medium">
                        {new Date(adm.admissionDate).toLocaleDateString()}
                        <div className="text-[10px] text-slate-400">
                          {new Date(adm.admissionDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </TableCell>

                      {/* Discharge Date */}
                      <TableCell>
                        {adm.dischargeDate ? (
                          <>
                            <div>{new Date(adm.dischargeDate).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(adm.dischargeDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </>
                        ) : (
                          <span className="text-emerald-600 font-medium">Currently Admitted</span>
                        )}
                      </TableCell>

                      {/* Patient */}
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {adm.patientId?.name || "Unknown"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {adm.patientId?.uhid || adm.patientId?.contact || "No UHID"}
                        </div>
                      </TableCell>

                      {/* Ward & Bed */}
                      <TableCell>
                        <div>Bed {adm.bedId?.bedNumber || "N/A"}</div>
                        <div className="text-[10px] text-slate-500">
                          {adm.bedId?.roomId?.wardId?.wardName || "General Ward"}
                        </div>
                      </TableCell>

                      {/* Doctor */}
                      <TableCell>
                        <div>Dr. {adm.doctorId?.name || "Attending"}</div>
                      </TableCell>

                      {/* Duration */}
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {getDurationText(adm.admissionDate, adm.dischargeDate)}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(adm.status)}</TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => openDetails(adm)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Details
                          </Button>
                          {adm.status === "DISCHARGED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() => router.push(`/admissions/summary?id=${adm._id}`)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              Summary
                            </Button>
                          )}
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedAdmission && (
            <div>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedAdmission.status)}
                  <Badge variant="outline">{selectedAdmission.admissionType}</Badge>
                </div>
                <DialogTitle className="text-xl font-bold mt-2">
                  {selectedAdmission.patientId?.name}
                </DialogTitle>
                <DialogDescription>
                  UHID: {selectedAdmission.patientId?.uhid || "N/A"} • Admission ID: {selectedAdmission._id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-sm">
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <div>
                    <span className="text-xs text-slate-500 block">Admission Date</span>
                    <span className="font-medium">
                      {new Date(selectedAdmission.admissionDate).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Discharge Date</span>
                    <span className="font-medium">
                      {selectedAdmission.dischargeDate
                        ? new Date(selectedAdmission.dischargeDate).toLocaleString()
                        : "Still Admitted"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Ward & Bed</span>
                    <span className="font-medium">
                      Bed {selectedAdmission.bedId?.bedNumber} • Room{" "}
                      {selectedAdmission.bedId?.roomId?.roomNumber || "N/A"} (
                      {selectedAdmission.bedId?.roomId?.wardId?.wardName || "General"})
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Attending Doctor</span>
                    <span className="font-medium">Dr. {selectedAdmission.doctorId?.name}</span>
                  </div>
                </div>

                {/* Clinical Notes & Diagnosis */}
                <div className="p-3 border rounded-lg space-y-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Clinical Record
                  </span>
                  <div>
                    <span className="text-xs text-slate-500">Admitting Diagnosis: </span>
                    <span>{selectedAdmission.initialDiagnosis || "Not recorded"}</span>
                  </div>
                  {selectedAdmission.finalDiagnosis && (
                    <div>
                      <span className="text-xs text-slate-500">Final Diagnosis: </span>
                      <span className="font-semibold text-emerald-600">
                        {selectedAdmission.finalDiagnosis}
                      </span>
                    </div>
                  )}
                  {selectedAdmission.dischargeCondition && (
                    <div>
                      <span className="text-xs text-slate-500">Discharge Outcome: </span>
                      <Badge variant="outline">{selectedAdmission.dischargeCondition}</Badge>
                    </div>
                  )}
                  {selectedAdmission.notes && (
                    <div className="pt-2 border-t text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold block">Notes:</span>
                      <p className="whitespace-pre-line mt-1">{selectedAdmission.notes}</p>
                    </div>
                  )}
                </div>

                {/* Transfer History Timeline */}
                {selectedAdmission.transferHistory && selectedAdmission.transferHistory.length > 0 && (
                  <div className="p-3 border rounded-lg space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Internal Transfers Recorded ({selectedAdmission.transferHistory.length})
                    </span>
                    <div className="space-y-2">
                      {selectedAdmission.transferHistory.map((t: any, i: number) => (
                        <div key={i} className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded">
                          <div className="font-medium">
                            Bed {t.fromBedId?.bedNumber || "Prior"} → Bed {t.toBedId?.bedNumber || "New"}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Reason: {t.reason} • Date: {new Date(t.transferDate).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                {selectedAdmission.status === "DISCHARGED" && (
                  <Button
                    className="bg-emerald-600 text-white"
                    onClick={() => {
                      setDetailsOpen(false);
                      router.push(`/admissions/summary?id=${selectedAdmission._id}`);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1.5" />
                    View Discharge Summary
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
