"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  Search,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Trash2,
  Printer,
  Loader2,
  Calendar,
  User,
  CheckCircle2
} from "lucide-react";

export default function MedicalRecordsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [patientFilter, setPatientFilter] = useState("ALL");

  // View modal
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const loadData = async () => {
    try {
      const [recRes, patRes] = await Promise.all([
        fetch("/api/clinical/records"),
        fetch("/api/patient")
      ]);

      const [recData, patData] = await Promise.all([
        recRes.json(),
        patRes.json()
      ]);

      if (recData.success) setRecords(recData.data || []);
      if (patData.success) setPatients(patData.data || []);
    } catch (err) {
      toast("Failed to load medical records", "error");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this clinical record?")) return;
    try {
      const res = await fetch(`/api/clinical/records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Record deleted successfully", "success");
        loadData();
      } else {
        toast(data.error || "Failed to delete record", "error");
      }
    } catch (err) {
      toast("Error deleting record", "error");
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (r.patient?.name || "").toLowerCase();
      const uhid = (r.patient?.uhid || "").toLowerCase();
      const title = (r.title || r.chiefComplaint || r.assessment || r.details || "").toLowerCase();
      const docName = (r.doctor?.name || "").toLowerCase();

      const matchesSearch =
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        title.includes(q) ||
        docName.includes(q);

      let matchesType = true;
      if (typeFilter !== "ALL") {
        matchesType = r.recordType === typeFilter;
      }

      let matchesPatient = true;
      if (patientFilter !== "ALL") {
        const pId = r.patient?._id || r.patient;
        matchesPatient = pId === patientFilter;
      }

      return matchesSearch && matchesType && matchesPatient;
    });
  }, [records, searchQuery, typeFilter, patientFilter]);

  const exportCSV = () => {
    if (filteredRecords.length === 0) {
      toast("No records to export", "error");
      return;
    }

    const headers = [
      "Date",
      "Record Type",
      "Patient Name",
      "UHID",
      "Doctor",
      "Title / Summary",
      "Status"
    ];

    const rows = filteredRecords.map((r) => [
      `"${new Date(r.dateRecorded || r.createdAt).toLocaleDateString()}"`,
      `"${r.recordType}"`,
      `"${r.patient?.name || ""}"`,
      `"${r.patient?.uhid || ""}"`,
      `"Dr. ${r.doctor?.name || ""}"`,
      `"${(r.title || r.chiefComplaint || r.details || "").replace(/"/g, '""')}"`,
      r.status || "Final"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Medical_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Medical records exported successfully", "success");
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
            <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Medical Records Dossier
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Centralized digital health repository storing all inpatient and outpatient clinical documentation.
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
            onClick={() => router.push("/clinical/consultations")}
          >
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient, UHID, title, details, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Document Types</option>
                <option value="Consultation">Consultation</option>
                <option value="Clinical Note">Clinical Note</option>
                <option value="Treatment Plan">Treatment Plan</option>
                <option value="Medical History">Medical History</option>
                <option value="Allergy">Allergy</option>
                <option value="Clinical Order">Clinical Order</option>
                <option value="Referral">Referral</option>
                <option value="Follow-Up">Follow-Up</option>
                <option value="Patient Problem">Patient Problem</option>
              </Select>
            </div>

            <div>
              <Select
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Patients</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.uhid || p.contact})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Medical Records Archive</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {records.length} digital health documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Title / Summary</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No clinical documents found matching the filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((r) => (
                    <TableRow key={r._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                        {new Date(r.dateRecorded || r.createdAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short"
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {r.patient?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {r.patient?.uhid} • {r.patient?.gender}, {r.patient?.age}y
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {r.recordType}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-xs truncate text-slate-800 dark:text-slate-200 font-medium">
                        {r.title || r.chiefComplaint || r.assessment || r.details || "Clinical Entry"}
                      </TableCell>

                      <TableCell className="font-medium">
                        Dr. {r.doctor?.name || "Physician"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            r.status === "Final"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }
                        >
                          {r.status || "Final"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                            onClick={() => setSelectedRecord(r)}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 text-rose-600 hover:text-rose-700"
                            onClick={() => handleDelete(r._id)}
                          >
                            <Trash2 className="h-3 w-3" />
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

      {/* View Document Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-xl">
          {selectedRecord && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  {selectedRecord.recordType} Record
                </DialogTitle>
                <DialogDescription>
                  Recorded on {new Date(selectedRecord.dateRecorded || selectedRecord.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedRecord.patient?.name}
                </div>
                <div className="text-slate-500 text-[11px]">
                  UHID: {selectedRecord.patient?.uhid} • Contact: {selectedRecord.patient?.contact}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Attending: Dr. {selectedRecord.doctor?.name || "Medical Officer"}
                </div>
              </div>

              <div className="space-y-3">
                {selectedRecord.title && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                      Title
                    </span>
                    <p className="text-slate-900 dark:text-white font-medium mt-0.5">
                      {selectedRecord.title}
                    </p>
                  </div>
                )}

                {selectedRecord.chiefComplaint && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                      Chief Complaint
                    </span>
                    <p className="text-slate-900 dark:text-white mt-0.5">
                      {selectedRecord.chiefComplaint}
                    </p>
                  </div>
                )}

                {selectedRecord.details && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                      Clinical Details
                    </span>
                    <p className="text-slate-900 dark:text-white mt-0.5 whitespace-pre-wrap">
                      {selectedRecord.details}
                    </p>
                  </div>
                )}

                {selectedRecord.assessment && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                      Assessment
                    </span>
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                      {selectedRecord.assessment}
                    </p>
                  </div>
                )}

                {selectedRecord.plan && (
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase">
                      Plan / Orders
                    </span>
                    <p className="text-slate-900 dark:text-white mt-0.5 whitespace-pre-wrap">
                      {selectedRecord.plan}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between items-center sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>

                <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
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
