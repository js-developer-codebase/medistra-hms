"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  Activity,
  BedDouble,
  Building,
  DoorOpen,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowRightLeft,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from "lucide-react";

export default function BedOccupancyPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const [statsRes, admRes, wardRes] = await Promise.all([
        fetch("/api/ward/stats"),
        fetch("/api/admission?status=ACTIVE"),
        fetch("/api/ward")
      ]);

      const [statsData, admData, wardData] = await Promise.all([
        statsRes.json(),
        admRes.json(),
        wardRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (admData.success) setAdmissions(admData.data || []);
      if (wardData.success) setWards(wardData.data || []);
    } catch (err) {
      toast("Failed to load bed occupancy metrics", "error");
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

  const getDurationText = (admissionDate: string) => {
    const start = new Date(admissionDate).getTime();
    const now = Date.now();
    const diffHours = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60)));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    if (days === 0) return `${hours} hrs`;
    return `${days}d ${hours}h`;
  };

  // Filtered Inpatient Occupancy Roster
  const filteredInpatients = useMemo(() => {
    return admissions.filter((adm) => {
      const q = searchQuery.toLowerCase().trim();
      const patientName = adm.patientId?.name?.toLowerCase() || "";
      const uhid = adm.patientId?.uhid?.toLowerCase() || "";
      const bedNumber = adm.bedId?.bedNumber?.toLowerCase() || "";
      const doctorName = adm.doctorId?.name?.toLowerCase() || "";
      const diagnosis = (adm.initialDiagnosis || adm.reasonForAdmission || "").toLowerCase();

      const matchesSearch =
        !q ||
        patientName.includes(q) ||
        uhid.includes(q) ||
        bedNumber.includes(q) ||
        doctorName.includes(q) ||
        diagnosis.includes(q);

      let matchesWard = true;
      if (wardFilter !== "ALL") {
        const wId = adm.bedId?.roomId?.wardId?._id || adm.bedId?.roomId?.wardId;
        matchesWard = wId === wardFilter;
      }

      let matchesType = true;
      if (typeFilter !== "ALL") {
        matchesType = adm.admissionType === typeFilter;
      }

      return matchesSearch && matchesWard && matchesType;
    });
  }, [admissions, searchQuery, wardFilter, typeFilter]);

  // Average Length of Stay calculation
  const alosText = useMemo(() => {
    if (admissions.length === 0) return "0 days";
    let totalHours = 0;
    admissions.forEach((adm) => {
      const start = new Date(adm.admissionDate).getTime();
      const diffHours = Math.max(0, (Date.now() - start) / (1000 * 60 * 60));
      totalHours += diffHours;
    });
    const avgDays = (totalHours / (admissions.length * 24)).toFixed(1);
    return `${avgDays} days`;
  }, [admissions]);

  const exportCSV = () => {
    if (filteredInpatients.length === 0) {
      toast("No occupancy records to export", "error");
      return;
    }

    const headers = [
      "Bed Number",
      "Ward Name",
      "Room Number",
      "Patient UHID",
      "Patient Name",
      "Age",
      "Gender",
      "Attending Doctor",
      "Admission Date",
      "Stay Duration",
      "Admission Type",
      "Diagnosis"
    ];

    const rows = filteredInpatients.map((adm) => [
      `"${adm.bedId?.bedNumber || "Unassigned"}"`,
      `"${adm.bedId?.roomId?.wardId?.wardName || "N/A"}"`,
      `"${adm.bedId?.roomId?.roomNumber || "N/A"}"`,
      `"${adm.patientId?.uhid || ""}"`,
      `"${adm.patientId?.name || ""}"`,
      adm.patientId?.age || "",
      adm.patientId?.gender || "",
      `"Dr. ${adm.doctorId?.name || ""}"`,
      `"${new Date(adm.admissionDate).toLocaleDateString()}"`,
      `"${getDurationText(adm.admissionDate)}"`,
      adm.admissionType || "ELECTIVE",
      `"${(adm.initialDiagnosis || adm.reasonForAdmission || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bed_Occupancy_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Occupancy report exported successfully", "success");
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
            <Activity className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Bed Occupancy & Census Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time inpatient census, ward-by-ward bed utilization, and length-of-stay tracking.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Hospital Occupancy</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {stats?.occupancyRate || 0}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {stats?.occupiedBeds || 0} of {stats?.totalBeds || 0} beds
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Active Inpatients</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {admissions.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Admitted under care</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Available Capacity</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats?.availableBeds || 0}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Vacant for intake</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Avg. Length of Stay</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {alosText}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Current inpatients</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Ward Occupancy Breakdown Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Ward-by-Ward Occupancy Census
          </h2>
          <span className="text-xs text-slate-500">
            {stats?.wardStats?.length || 0} Wards Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(!stats?.wardStats || stats.wardStats.length === 0) ? (
            <div className="col-span-4 p-8 text-center text-slate-400 border rounded-lg">
              No wards configured.
            </div>
          ) : (
            stats.wardStats.map((w: any) => {
              const rate = w.occupancyRate || 0;
              const isCritical = rate >= 85;
              const isHigh = rate >= 70 && rate < 85;
              return (
                <div
                  key={w.wardId}
                  className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {w.wardName}
                      </h3>
                      <div className="text-[10px] text-slate-400">
                        {w.wardType} • Floor {w.floor}
                      </div>
                    </div>
                    <Badge
                      className={
                        isCritical
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                          : isHigh
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                      }
                    >
                      {rate}% Full
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCritical
                            ? "bg-rose-500"
                            : isHigh
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, rate)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Occupied: {w.occupiedBeds}</span>
                      <span>Vacant: {w.availableBeds}</span>
                      <span>Total: {w.totalBeds}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient, UHID, bed #, doctor, diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div>
              <Select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Wards</option>
                {wards.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.wardName} (Floor {w.floor})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Admission Types</option>
                <option value="ELECTIVE">Elective</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="TRANSFER">Transfer</option>
                <option value="DAYCARE">Daycare</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Occupied Beds Roster Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Occupied Beds Inpatient Census</CardTitle>
          <CardDescription>
            Showing {filteredInpatients.length} of {admissions.length} inpatients currently occupying hospital beds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bed & Room</TableHead>
                  <TableHead>Ward & Floor</TableHead>
                  <TableHead>Inpatient Particulars</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Stay Duration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInpatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-12 text-xs">
                      No occupied bed records match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInpatients.map((adm) => (
                    <TableRow key={adm._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      {/* Bed & Room */}
                      <TableCell>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <BedDouble className="h-3.5 w-3.5 text-amber-600" />
                          Bed {adm.bedId?.bedNumber || "Unassigned"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Room {adm.bedId?.roomId?.roomNumber || "N/A"}
                        </div>
                      </TableCell>

                      {/* Ward */}
                      <TableCell>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {adm.bedId?.roomId?.wardId?.wardName || "General Ward"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Floor {adm.bedId?.roomId?.wardId?.floor ?? 1}
                        </div>
                      </TableCell>

                      {/* Patient */}
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {adm.patientId?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {adm.patientId?.uhid || adm.patientId?.contact} • {adm.patientId?.gender},{" "}
                          {adm.patientId?.age}y
                        </div>
                      </TableCell>

                      {/* Doctor */}
                      <TableCell>
                        <div className="font-medium">Dr. {adm.doctorId?.name || "Attending"}</div>
                      </TableCell>

                      {/* Admitted At */}
                      <TableCell className="text-slate-500">
                        {new Date(adm.admissionDate).toLocaleDateString()}
                      </TableCell>

                      {/* Stay Duration */}
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {getDurationText(adm.admissionDate)}
                        </Badge>
                      </TableCell>

                      {/* Admission Type */}
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            adm.admissionType === "EMERGENCY"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : ""
                          }
                        >
                          {adm.admissionType || "ELECTIVE"}
                        </Badge>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs flex items-center gap-1 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800 hover:bg-purple-50 ml-auto"
                          onClick={() => router.push(`/wards/transfer?admissionId=${adm._id}`)}
                        >
                          <ArrowRightLeft className="h-3 w-3" />
                          Transfer
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
