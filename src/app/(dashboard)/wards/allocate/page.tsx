"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  BedDouble,
  User,
  Building,
  DoorOpen,
  Search,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  Wrench,
  Download,
  Loader2,
  Clock
} from "lucide-react";

export default function BedAllocationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <BedAllocationContent />
    </Suspense>
  );
}

function BedAllocationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAdmissionId = searchParams.get("admissionId") || "";
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data lists
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);

  // Dialog State
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState(initialAdmissionId);
  const [selectedWardId, setSelectedWardId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");
  const [allocationNotes, setAllocationNotes] = useState("");

  // Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const [admRes, wardRes, roomRes, bedRes] = await Promise.all([
        fetch("/api/admission?status=ACTIVE"),
        fetch("/api/ward"),
        fetch("/api/room"),
        fetch("/api/bed")
      ]);

      const [admData, wardData, roomData, bedData] = await Promise.all([
        admRes.json(),
        wardRes.json(),
        roomRes.json(),
        bedRes.json()
      ]);

      if (admData.success) {
        const list = admData.data || [];
        setAdmissions(list);
        if (initialAdmissionId) {
          const match = list.find((a: any) => a._id === initialAdmissionId);
          if (match) {
            setSelectedAdmissionId(match._id);
            setAllocateOpen(true);
          }
        }
      }
      if (wardData.success) setWards(wardData.data || []);
      if (roomData.success) setRooms(roomData.data || []);
      if (bedData.success) setBeds(bedData.data || []);
    } catch (err) {
      toast("Failed to load allocation workstation data", "error");
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

  // Cascading Available Rooms by Ward
  const availableRooms = useMemo(() => {
    if (!selectedWardId) return rooms;
    return rooms.filter((r) => {
      const wId = typeof r.wardId === "object" ? r.wardId?._id : r.wardId;
      return wId === selectedWardId;
    });
  }, [rooms, selectedWardId]);

  // Cascading Available Beds by Room & Ward
  const availableBeds = useMemo(() => {
    return beds.filter((b) => {
      if (b.status !== "AVAILABLE") return false;
      if (selectedRoomId) {
        const rId = typeof b.roomId === "object" ? b.roomId?._id : b.roomId;
        if (rId !== selectedRoomId) return false;
      }
      if (selectedWardId) {
        const wId =
          typeof b.roomId === "object" && typeof b.roomId?.wardId === "object"
            ? b.roomId?.wardId?._id
            : b.roomId?.wardId;
        if (wId && wId !== selectedWardId) return false;
      }
      return true;
    });
  }, [beds, selectedWardId, selectedRoomId]);

  const handleOpenAllocate = (admission?: any) => {
    if (admission) {
      setSelectedAdmissionId(admission._id);
    } else if (admissions.length > 0) {
      setSelectedAdmissionId(admissions[0]._id);
    }
    setSelectedWardId("");
    setSelectedRoomId("");
    setSelectedBedId("");
    setAllocationNotes("");
    setAllocateOpen(true);
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmissionId || !selectedBedId) {
      toast("Please select both an admission and an available destination bed", "error");
      return;
    }

    setSubmitting(true);
    try {
      const adm = admissions.find((a) => a._id === selectedAdmissionId);
      const prevBedId = adm?.bedId?._id || adm?.bedId;

      // 1. If patient already had a bed, free it or transfer
      if (prevBedId && prevBedId !== selectedBedId) {
        await fetch(`/api/bed/${prevBedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "AVAILABLE" })
        });
      }

      // 2. Mark destination bed as OCCUPIED
      await fetch(`/api/bed/${selectedBedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "OCCUPIED" })
      });

      // 3. Update Admission record with new bedId
      const updateRes = await fetch(`/api/admission/${selectedAdmissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedId: selectedBedId,
          notes: allocationNotes ? `${adm?.notes || ""}\n[Bed Allocated]: ${allocationNotes}` : adm?.notes
        })
      });

      const updateData = await updateRes.json();
      if (updateRes.ok && updateData.success) {
        toast("Bed allocated to patient successfully!", "success");
        setAllocateOpen(false);
        loadData();
      } else {
        toast(updateData.message || "Failed to link bed allocation to admission", "error");
      }
    } catch (err) {
      toast("An error occurred during bed allocation", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Release Bed action
  const handleReleaseBed = async (admission: any) => {
    const bedId = admission.bedId?._id || admission.bedId;
    if (!bedId) return;

    if (!confirm(`Are you sure you want to release Bed ${admission.bedId?.bedNumber} for cleaning/sanitization?`)) {
      return;
    }

    try {
      await fetch(`/api/bed/${bedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "MAINTENANCE" })
      });
      toast(`Bed marked as MAINTENANCE / Cleaning`, "success");
      loadData();
    } catch (err) {
      toast("Failed to update bed status", "error");
    }
  };

  // Filtered Allocations
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((adm) => {
      const q = searchQuery.toLowerCase().trim();
      const patientName = adm.patientId?.name?.toLowerCase() || "";
      const uhid = adm.patientId?.uhid?.toLowerCase() || "";
      const bedNumber = adm.bedId?.bedNumber?.toLowerCase() || "";
      const doctorName = adm.doctorId?.name?.toLowerCase() || "";

      const matchesSearch =
        !q ||
        patientName.includes(q) ||
        uhid.includes(q) ||
        bedNumber.includes(q) ||
        doctorName.includes(q);

      let matchesWard = true;
      if (wardFilter !== "ALL") {
        const wId = adm.bedId?.roomId?.wardId?._id || adm.bedId?.roomId?.wardId;
        matchesWard = wId === wardFilter;
      }

      return matchesSearch && matchesWard;
    });
  }, [admissions, searchQuery, wardFilter]);

  const getDurationText = (admissionDate: string) => {
    const start = new Date(admissionDate).getTime();
    const now = Date.now();
    const diffHours = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60)));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;
    if (days === 0) return `${hours} hrs`;
    return `${days}d ${hours}h`;
  };

  const exportCSV = () => {
    if (filteredAdmissions.length === 0) {
      toast("No allocation records to export", "error");
      return;
    }

    const headers = [
      "Bed Number",
      "Ward",
      "Room",
      "Patient UHID",
      "Patient Name",
      "Age",
      "Gender",
      "Attending Doctor",
      "Admission Date",
      "Length of Stay"
    ];

    const rows = filteredAdmissions.map((adm) => [
      `"${adm.bedId?.bedNumber || "Unassigned"}"`,
      `"${adm.bedId?.roomId?.wardId?.wardName || "N/A"}"`,
      `"${adm.bedId?.roomId?.roomNumber || "N/A"}"`,
      `"${adm.patientId?.uhid || ""}"`,
      `"${adm.patientId?.name || ""}"`,
      adm.patientId?.age || "",
      adm.patientId?.gender || "",
      `"Dr. ${adm.doctorId?.name || ""}"`,
      `"${new Date(adm.admissionDate).toLocaleDateString()}"`,
      `"${getDurationText(adm.admissionDate)}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bed_Allocations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Bed allocations exported successfully", "success");
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
            <BedDouble className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Bed Allocation Workstation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Allocate and assign available hospital beds to admitted patients, manage occupancy, and release beds.
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
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5"
            onClick={() => handleOpenAllocate()}
          >
            <Plus className="h-4 w-4" />
            Allocate Bed
          </Button>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Inpatients</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {admissions.length}
          </span>
          <span className="text-[10px] text-slate-400">Currently admitted</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Available Beds</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {beds.filter((b) => b.status === "AVAILABLE").length}
          </span>
          <span className="text-[10px] text-emerald-600">Ready for allocation</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Occupied Beds</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {beds.filter((b) => b.status === "OCCUPIED").length}
          </span>
          <span className="text-[10px] text-amber-600">Currently assigned</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">In Maintenance</span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
            {beds.filter((b) => b.status === "MAINTENANCE").length}
          </span>
          <span className="text-[10px] text-slate-400">Cleaning / sanitization</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient, UHID, bed number, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-64">
              <Select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Wards</option>
                {wards.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.wardName} (Floor {w.floor})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Bed Allocations Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Bed Assignments</CardTitle>
          <CardDescription>
            Showing {filteredAdmissions.length} of {admissions.length} admitted inpatients with allocated beds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Allocated Bed</TableHead>
                  <TableHead>Ward & Room</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Attending Doctor</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Stay Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No active bed allocations found matching filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmissions.map((adm) => (
                    <TableRow key={adm._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      {/* Bed Number */}
                      <TableCell>
                        <div className="font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                          <BedDouble className="h-3.5 w-3.5" />
                          Bed {adm.bedId?.bedNumber || "Unassigned"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {adm.bedId?.bedType || "Standard"} Bed
                        </div>
                      </TableCell>

                      {/* Ward & Room */}
                      <TableCell>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {adm.bedId?.roomId?.wardId?.wardName || "General Ward"}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Room {adm.bedId?.roomId?.roomNumber || "N/A"} • Floor{" "}
                          {adm.bedId?.roomId?.wardId?.floor ?? 1}
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

                      {/* Admission Date */}
                      <TableCell className="text-slate-500">
                        {new Date(adm.admissionDate).toLocaleDateString()}
                      </TableCell>

                      {/* Duration */}
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {getDurationText(adm.admissionDate)}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800 hover:bg-purple-50"
                            onClick={() => router.push(`/wards/transfer?admissionId=${adm._id}`)}
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                            Transfer
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs flex items-center gap-1 text-rose-600 border-rose-300 dark:border-rose-800 hover:bg-rose-50"
                            onClick={() => handleReleaseBed(adm)}
                          >
                            <Wrench className="h-3 w-3" />
                            Clean
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

      {/* Allocate Bed Modal */}
      <Dialog open={allocateOpen} onOpenChange={setAllocateOpen}>
        <DialogContent className="max-w-xl">
          <form onSubmit={handleAllocateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-teal-600" />
                Allocate Bed to Patient
              </DialogTitle>
              <DialogDescription>
                Assign or reassign an available hospital bed to an active admitted patient.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              {/* Patient Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="patientAdmission" className="text-xs font-semibold">
                  Select Inpatient *
                </Label>
                <Select
                  id="patientAdmission"
                  value={selectedAdmissionId}
                  onChange={(e) => setSelectedAdmissionId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Admitted Patient --</option>
                  {admissions.map((adm) => (
                    <option key={adm._id} value={adm._id}>
                      {adm.patientId?.name} ({adm.patientId?.uhid || "No UHID"}) — Currently: Bed{" "}
                      {adm.bedId?.bedNumber || "Unassigned"}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Destination Ward */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="destWard" className="text-xs font-semibold">
                    Target Ward
                  </Label>
                  <Select
                    id="destWard"
                    value={selectedWardId}
                    onChange={(e) => {
                      setSelectedWardId(e.target.value);
                      setSelectedRoomId("");
                      setSelectedBedId("");
                    }}
                  >
                    <option value="">-- All Wards --</option>
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.wardName} (Floor {w.floor})
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="destRoom" className="text-xs font-semibold">
                    Target Room
                  </Label>
                  <Select
                    id="destRoom"
                    value={selectedRoomId}
                    onChange={(e) => {
                      setSelectedRoomId(e.target.value);
                      setSelectedBedId("");
                    }}
                  >
                    <option value="">-- All Rooms --</option>
                    {availableRooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        Room {r.roomNumber} ({r.roomType})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Destination Bed */}
              <div className="space-y-1.5">
                <Label htmlFor="destBed" className="text-xs font-semibold">
                  Select Available Bed * ({availableBeds.length} Available)
                </Label>
                <Select
                  id="destBed"
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Available Bed --</option>
                  {availableBeds.map((b) => (
                    <option key={b._id} value={b._id}>
                      Bed {b.bedNumber} — Room {b.roomId?.roomNumber || "N/A"} (
                      {b.roomId?.wardId?.wardName || "General Ward"}) • Type: {b.bedType}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Allocation Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="allocNotes" className="text-xs font-semibold">
                  Allocation Remarks / Clinical Reason
                </Label>
                <Input
                  id="allocNotes"
                  placeholder="e.g. Assigned to semi-private room on patient request..."
                  value={allocationNotes}
                  onChange={(e) => setAllocationNotes(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setAllocateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Allocating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm Allocation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
