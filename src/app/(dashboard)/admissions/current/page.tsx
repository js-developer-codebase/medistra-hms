"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Bed,
  Search,
  UserPlus,
  ArrowRightLeft,
  LogOut,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Clock,
  User,
  Shield,
  Activity,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function CurrentAdmissionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Details Modal State
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchAdmissions = async () => {
    try {
      const res = await fetch("/api/admission?status=ACTIVE");
      const result = await res.json();
      if (res.ok && result.success) {
        setAdmissions(result.data || []);
      } else {
        toast(result.message || "Failed to fetch admissions", "error");
      }
    } catch (err: any) {
      toast("An error occurred while fetching admissions", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdmissions();
  };

  const getDurationText = (admissionDate: string) => {
    const start = new Date(admissionDate).getTime();
    const now = Date.now();
    const diffHours = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60)));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    if (days === 0) return `${hours} hrs`;
    return `${days}d ${hours}h`;
  };

  // Filtered Admissions
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((adm) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const patientName = adm.patientId?.name?.toLowerCase() || "";
      const patientUhid = adm.patientId?.uhid?.toLowerCase() || "";
      const patientContact = adm.patientId?.contact || "";
      const bedNumber = adm.bedId?.bedNumber?.toLowerCase() || "";
      const doctorName = adm.doctorId?.name?.toLowerCase() || "";
      const wardName = adm.bedId?.roomId?.wardId?.wardName?.toLowerCase() || "";

      const matchesSearch =
        !q ||
        patientName.includes(q) ||
        patientUhid.includes(q) ||
        patientContact.includes(q) ||
        bedNumber.includes(q) ||
        doctorName.includes(q) ||
        wardName.includes(q);

      // Type filter
      const matchesType = typeFilter === "ALL" || adm.admissionType === typeFilter;

      // Status filter
      const matchesStatus = statusFilter === "ALL" || adm.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [admissions, searchQuery, typeFilter, statusFilter]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: admissions.length,
      emergency: admissions.filter((a) => a.admissionType === "EMERGENCY").length,
      elective: admissions.filter((a) => a.admissionType === "ELECTIVE").length,
      daycare: admissions.filter((a) => a.admissionType === "DAYCARE").length
    };
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
      "Ward",
      "Room",
      "Bed Number",
      "Attending Doctor",
      "Admission Date",
      "Length of Stay",
      "Admission Type",
      "Status"
    ];

    const rows = filteredAdmissions.map((adm) => [
      `"${adm.patientId?.uhid || ""}"`,
      `"${adm.patientId?.name || ""}"`,
      adm.patientId?.age || "",
      adm.patientId?.gender || "",
      `"${adm.patientId?.contact || ""}"`,
      `"${adm.bedId?.roomId?.wardId?.wardName || ""}"`,
      `"${adm.bedId?.roomId?.roomNumber || ""}"`,
      `"${adm.bedId?.bedNumber || ""}"`,
      `"Dr. ${adm.doctorId?.name || ""}"`,
      `"${new Date(adm.admissionDate).toLocaleString()}"`,
      `"${getDurationText(adm.admissionDate)}"`,
      adm.admissionType || "",
      adm.status || ""
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Current_Admissions_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Current admissions exported successfully", "success");
  };

  const openDetails = (admission: any) => {
    setSelectedAdmission(admission);
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
            <Bed className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Current Inpatients
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time management of patients currently admitted to hospital beds.
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            onClick={() => router.push("/admissions/new")}
          >
            <UserPlus className="h-4 w-4" />
            New Admission
          </Button>
        </div>
      </div>

      {/* KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Inpatients
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {counts.total}
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Bed className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Emergency
            </div>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              {counts.emergency}
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Elective
            </div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {counts.elective}
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Daycare
            </div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
              {counts.daycare}
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient name, UHID, phone, bed, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full"
              >
                <option value="ALL">All Admission Types</option>
                <option value="ELECTIVE">Elective</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="TRANSFER">Transfer</option>
                <option value="DAYCARE">Daycare</option>
              </Select>
            </div>

            <div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full"
              >
                <option value="ALL">All Active (Admitted & Transferred)</option>
                <option value="ADMITTED">Admitted</option>
                <option value="TRANSFERRED">Transferred</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inpatients Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Active Inpatient Roster</CardTitle>
            <CardDescription>
              Showing {filteredAdmissions.length} of {admissions.length} active inpatients
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Ward & Bed</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Admitted At</TableHead>
                  <TableHead>Stay Duration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Bed className="h-10 w-10 text-slate-300 mb-2" />
                        <p className="font-medium">No current admissions found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {searchQuery
                            ? "Try adjusting your search query or filters"
                            : "There are currently no patients occupying beds"}
                        </p>
                        {!searchQuery && (
                          <Button
                            size="sm"
                            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => router.push("/admissions/new")}
                          >
                            Admit a Patient
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmissions.map((adm) => (
                    <TableRow key={adm._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      {/* Patient Details */}
                      <TableCell>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {adm.patientId?.name || "Unknown Patient"}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          {adm.patientId?.uhid && (
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">
                              {adm.patientId.uhid}
                            </span>
                          )}
                          <span>
                            {adm.patientId?.gender} • {adm.patientId?.age}y
                          </span>
                        </div>
                      </TableCell>

                      {/* Ward & Bed */}
                      <TableCell>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Bed {adm.bedId?.bedNumber || "N/A"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {adm.bedId?.roomId?.wardId?.wardName || "General Ward"} • Room{" "}
                          {adm.bedId?.roomId?.roomNumber || "N/A"}
                        </div>
                      </TableCell>

                      {/* Attending Doctor */}
                      <TableCell>
                        <div className="font-medium text-slate-900 dark:text-white">
                          Dr. {adm.doctorId?.name || "Attending Doctor"}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[150px]">
                          {adm.doctorId?.email || ""}
                        </div>
                      </TableCell>

                      {/* Admission Date */}
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(adm.admissionDate).toLocaleDateString()}
                        <div className="text-[11px] text-slate-400">
                          {new Date(adm.admissionDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </TableCell>

                      {/* Stay Duration */}
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono font-medium">
                          {getDurationText(adm.admissionDate)}
                        </Badge>
                      </TableCell>

                      {/* Admission Type */}
                      <TableCell>
                        <Badge
                          className={
                            adm.admissionType === "EMERGENCY"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300"
                              : adm.admissionType === "DAYCARE"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300"
                          }
                        >
                          {adm.admissionType || "ELECTIVE"}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title="View Inpatient Dossier"
                            onClick={() => openDetails(adm)}
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs flex items-center gap-1"
                            onClick={() =>
                              router.push(`/admissions/transfer?admissionId=${adm._id}`)
                            }
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                            Transfer
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 text-xs flex items-center gap-1"
                            onClick={() =>
                              router.push(`/admissions/discharge?admissionId=${adm._id}`)
                            }
                          >
                            <LogOut className="h-3 w-3" />
                            Discharge
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

      {/* Inpatient Dossier / Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedAdmission && (
            <div>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white">
                    {selectedAdmission.status}
                  </Badge>
                  <Badge variant="outline">
                    {selectedAdmission.admissionType}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-bold mt-2 text-slate-900 dark:text-white">
                  {selectedAdmission.patientId?.name}
                </DialogTitle>
                <DialogDescription>
                  UHID: {selectedAdmission.patientId?.uhid || "N/A"} • Contact:{" "}
                  {selectedAdmission.patientId?.contact || "N/A"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-sm">
                {/* Location & Doctor Details */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <div>
                    <span className="text-xs text-slate-500 block">Bed Location</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Bed {selectedAdmission.bedId?.bedNumber} ({selectedAdmission.bedId?.bedType})
                    </span>
                    <div className="text-xs text-slate-500">
                      Room {selectedAdmission.bedId?.roomId?.roomNumber || "N/A"} •{" "}
                      {selectedAdmission.bedId?.roomId?.wardId?.wardName || "General Ward"}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Attending Physician</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Dr. {selectedAdmission.doctorId?.name}
                    </span>
                    <div className="text-xs text-slate-500">
                      {selectedAdmission.doctorId?.email}
                    </div>
                  </div>
                </div>

                {/* Admission Timestamps */}
                <div className="grid grid-cols-2 gap-4 p-3 border rounded-lg">
                  <div>
                    <span className="text-xs text-slate-500 block">Admitted At</span>
                    <span className="font-medium">
                      {new Date(selectedAdmission.admissionDate).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Current Stay Duration</span>
                    <span className="font-medium font-mono text-emerald-600 dark:text-emerald-400">
                      {getDurationText(selectedAdmission.admissionDate)}
                    </span>
                  </div>
                </div>

                {/* Clinical Reasons & Diagnosis */}
                <div className="space-y-2 p-3 border rounded-lg">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Clinical Diagnosis & Reason
                  </span>
                  <div>
                    <span className="text-xs text-slate-500">Initial Diagnosis: </span>
                    <span className="font-medium">
                      {selectedAdmission.initialDiagnosis || "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Reason for Admission: </span>
                    <span>{selectedAdmission.reasonForAdmission || "Not specified"}</span>
                  </div>
                  {selectedAdmission.notes && (
                    <div className="pt-2 border-t mt-2">
                      <span className="text-xs text-slate-500 block">Clinical Notes:</span>
                      <p className="text-xs whitespace-pre-line text-slate-700 dark:text-slate-300 mt-1">
                        {selectedAdmission.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Emergency Contact & Insurance */}
                {(selectedAdmission.emergencyContact || selectedAdmission.insurance) && (
                  <div className="grid grid-cols-2 gap-4 p-3 border rounded-lg">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        Emergency Relative
                      </span>
                      <div className="text-xs mt-1">
                        {selectedAdmission.emergencyContact?.name || "N/A"}{" "}
                        {selectedAdmission.emergencyContact?.relation &&
                          `(${selectedAdmission.emergencyContact.relation})`}
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedAdmission.emergencyContact?.phone || ""}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        Insurance Coverage
                      </span>
                      <div className="text-xs mt-1">
                        {selectedAdmission.insurance?.provider || "Self / Cash"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedAdmission.insurance?.policyNumber
                          ? `Policy: ${selectedAdmission.insurance.policyNumber}`
                          : ""}
                      </div>
                    </div>
                  </div>
                )}

                {/* Transfer History Log (if any) */}
                {selectedAdmission.transferHistory &&
                  selectedAdmission.transferHistory.length > 0 && (
                    <div className="p-3 border rounded-lg space-y-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        Patient Transfer History ({selectedAdmission.transferHistory.length} moves)
                      </span>
                      <div className="space-y-2">
                        {selectedAdmission.transferHistory.map((t: any, index: number) => (
                          <div
                            key={index}
                            className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold">
                                Bed {t.fromBedId?.bedNumber || "Prior"} → Bed{" "}
                                {t.toBedId?.bedNumber || "New"}
                              </span>
                              <div className="text-[11px] text-slate-500">
                                Reason: {t.reason}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(t.transferDate).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    setDetailsOpen(false);
                    router.push(`/admissions/transfer?admissionId=${selectedAdmission._id}`);
                  }}
                >
                  <ArrowRightLeft className="h-4 w-4 mr-1.5" />
                  Transfer Patient
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailsOpen(false);
                    router.push(`/admissions/discharge?admissionId=${selectedAdmission._id}`);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Discharge Patient
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
