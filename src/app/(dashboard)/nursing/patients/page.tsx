"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Users,
  Search,
  RefreshCw,
  Download,
  HeartPulse,
  Pill,
  Droplets,
  FileText,
  Eye,
  ShieldAlert,
  Loader2,
  Calendar,
  User,
  BedDouble
} from "lucide-react";

export default function MyInpatientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <MyInpatientsContent />
    </Suspense>
  );
}

function MyInpatientsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [inpatients, setInpatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("ALL");

  // Selected Inpatient Modal
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/nursing/my-patients");
      const data = await res.json();
      if (data.success) {
        setInpatients(data.data || []);
      } else {
        toast("Failed to load inpatients", "error");
      }
    } catch (err) {
      toast("An error occurred while loading patient roster", "error");
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

  // Distinct Wards
  const availableWards = useMemo(() => {
    const set = new Set<string>();
    inpatients.forEach((p) => {
      if (p.wardName) set.add(p.wardName);
    });
    return Array.from(set);
  }, [inpatients]);

  const filteredInpatients = useMemo(() => {
    return inpatients.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (p.name || "").toLowerCase();
      const uhid = (p.uhid || "").toLowerCase();
      const bed = (p.bedNumber || "").toLowerCase();
      const ward = (p.wardName || "").toLowerCase();
      const doc = (p.doctorName || "").toLowerCase();
      const diag = (p.diagnosis || "").toLowerCase();

      const matchesSearch =
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        bed.includes(q) ||
        ward.includes(q) ||
        doc.includes(q) ||
        diag.includes(q);

      let matchesWard = true;
      if (wardFilter !== "ALL") {
        matchesWard = p.wardName === wardFilter;
      }

      return matchesSearch && matchesWard;
    });
  }, [inpatients, searchQuery, wardFilter]);

  const exportCSV = () => {
    if (filteredInpatients.length === 0) {
      toast("No inpatients to export", "error");
      return;
    }

    const headers = [
      "Bed Number",
      "Ward",
      "Room",
      "Patient Name",
      "UHID",
      "Age/Gender",
      "Admitting Doctor",
      "Diagnosis",
      "Admission Date"
    ];

    const rows = filteredInpatients.map((p) => [
      `"${p.bedNumber || ""}"`,
      `"${p.wardName || ""}"`,
      `"${p.roomNumber || ""}"`,
      `"${p.name || ""}"`,
      `"${p.uhid || ""}"`,
      `"${p.gender || ""}, ${p.age || ""}y"`,
      `"${p.doctorName || ""}"`,
      `"${(p.diagnosis || "").replace(/"/g, '""')}"`,
      `"${p.admissionDate ? new Date(p.admissionDate).toLocaleDateString() : ""}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ward_Inpatients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Inpatients roster exported successfully", "success");
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
            <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Ward Inpatient Care Roster
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Admitted patient management, assigned beds, primary physician care orders, and bedside interventions.
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
            <BedDouble className="h-4 w-4" />
            Admit Patient
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
                placeholder="Search patient, UHID, bed, room, ward, doctor, diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Wards</option>
                {availableWards.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inpatients Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Inpatients under Nursing Care</CardTitle>
          <CardDescription>
            Showing {filteredInpatients.length} of {inpatients.length} currently admitted ward patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bed & Room</TableHead>
                  <TableHead>Ward Location</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Admitting Diagnosis</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Allergies</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInpatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No admitted inpatients found matching filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInpatients.map((p) => (
                    <TableRow key={p.admissionId} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                          Bed {p.bedNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Room {p.roomNumber}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {p.wardName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Floor {p.floor} • {p.wardType}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {p.uhid} • {p.gender}, {p.age}y
                        </div>
                      </TableCell>

                      <TableCell className="font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                        {p.diagnosis}
                      </TableCell>

                      <TableCell className="font-medium">
                        {p.doctorName}
                      </TableCell>

                      <TableCell>
                        {p.allergies && p.allergies.length > 0 ? (
                          <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-300">
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            {p.allergies.join(", ")}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No known allergies</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => setSelectedPatient(p)}
                          >
                            <Eye className="h-3 w-3" />
                            Card
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                            onClick={() => router.push(`/nursing/vitals?patientId=${p.patientId}`)}
                          >
                            <HeartPulse className="h-3 w-3" />
                            Vitals
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                            onClick={() => router.push(`/nursing/medications?patientId=${p.patientId}`)}
                          >
                            <Pill className="h-3 w-3" />
                            Meds
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

      {/* Patient Clinical Care Card Modal */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-xl">
          {selectedPatient && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-600" />
                      {selectedPatient.name}
                    </DialogTitle>
                    <DialogDescription>
                      UHID: {selectedPatient.uhid} • Admission ID: #{selectedPatient.admissionId?.slice(-6).toUpperCase()}
                    </DialogDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                    Bed {selectedPatient.bedNumber}
                  </Badge>
                </div>
              </DialogHeader>

              {/* Demographics & Admission details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ward & Room</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedPatient.wardName}
                  </div>
                  <div className="text-slate-500 text-[11px]">Room {selectedPatient.roomNumber} (Fl {selectedPatient.floor})</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Attending Doctor</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedPatient.doctorName}
                  </div>
                  <div className="text-slate-500 text-[11px]">{selectedPatient.insurance}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Patient Demographics</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedPatient.gender}, {selectedPatient.age} years
                  </div>
                  <div className="text-slate-500 text-[11px]">Blood: {selectedPatient.bloodGroup || "Unknown"}</div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="p-3 border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Admitting Diagnosis & Notes</span>
                <p className="font-medium text-slate-900 dark:text-white text-xs">
                  {selectedPatient.diagnosis}
                </p>
                <div className="text-[11px] text-slate-500">
                  Admitted on {new Date(selectedPatient.admissionDate).toLocaleString([], { dateStyle: "long", timeStyle: "short" })}
                </div>
              </div>

              {/* Allergy Warning */}
              {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center gap-2 text-rose-700 dark:text-rose-300">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="font-bold block">Patient Allergy Alert:</span>
                    <span>Contraindications: {selectedPatient.allergies.join(", ")}</span>
                  </div>
                </div>
              )}

              {/* Clinical Action Navigation */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">Direct Bedside Workstations:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 justify-start"
                    onClick={() => {
                      setSelectedPatient(null);
                      router.push(`/nursing/vitals?patientId=${selectedPatient.patientId}`);
                    }}
                  >
                    <HeartPulse className="h-3.5 w-3.5 mr-1.5" />
                    Log Vitals
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-purple-600 border-purple-200 hover:bg-purple-50 justify-start"
                    onClick={() => {
                      setSelectedPatient(null);
                      router.push(`/nursing/medications?patientId=${selectedPatient.patientId}`);
                    }}
                  >
                    <Pill className="h-3.5 w-3.5 mr-1.5" />
                    eMAR Meds
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-cyan-600 border-cyan-200 hover:bg-cyan-50 justify-start"
                    onClick={() => {
                      setSelectedPatient(null);
                      router.push(`/nursing/notes?patientId=${selectedPatient.patientId}`);
                    }}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Nurse Note
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-sky-600 border-sky-200 hover:bg-sky-50 justify-start"
                    onClick={() => {
                      setSelectedPatient(null);
                      router.push(`/nursing/intake-output?patientId=${selectedPatient.patientId}`);
                    }}
                  >
                    <Droplets className="h-3.5 w-3.5 mr-1.5" />
                    I/O Balance
                  </Button>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
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
