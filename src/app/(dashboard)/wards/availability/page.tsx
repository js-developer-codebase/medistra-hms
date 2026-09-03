"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Layers,
  BedDouble,
  Building,
  DoorOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  User,
  Plus,
  RefreshCw,
  Loader2,
  ShieldCheck
} from "lucide-react";

export default function BedAvailabilityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <BedAvailabilityContent />
    </Suspense>
  );
}

function BedAvailabilityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlWardId = searchParams.get("wardId") || "ALL";
  const { toast } = useToast();

  const [beds, setBeds] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedWard, setSelectedWard] = useState(urlWardId);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Bed Status Edit Dialog
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("AVAILABLE");
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      const [bedRes, wardRes, admRes] = await Promise.all([
        fetch("/api/bed"),
        fetch("/api/ward"),
        fetch("/api/admission?status=ACTIVE")
      ]);

      const [bedData, wardData, admData] = await Promise.all([
        bedRes.json(),
        wardRes.json(),
        admRes.json()
      ]);

      if (bedData.success) setBeds(bedData.data || []);
      if (wardData.success) setWards(wardData.data || []);
      if (admData.success) setAdmissions(admData.data || []);
    } catch (err) {
      toast("Failed to load live bed board data", "error");
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

  // Map bedId to active admission
  const bedAdmissionMap = useMemo(() => {
    const map: Record<string, any> = {};
    admissions.forEach((adm) => {
      const bId = adm.bedId?._id || adm.bedId;
      if (bId) {
        map[bId.toString()] = adm;
      }
    });
    return map;
  }, [admissions]);

  // Filtered beds
  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      const wardId =
        typeof b.roomId === "object" && typeof b.roomId?.wardId === "object"
          ? b.roomId?.wardId?._id
          : b.roomId?.wardId;

      if (selectedWard !== "ALL" && wardId !== selectedWard) return false;
      if (selectedStatus !== "ALL" && b.status !== selectedStatus) return false;
      if (selectedType !== "ALL" && b.bedType !== selectedType) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const bedNo = (b.bedNumber || "").toLowerCase();
        const roomNo = (b.roomId?.roomNumber || "").toLowerCase();
        const wardName = (b.roomId?.wardId?.wardName || "").toLowerCase();
        const adm = bedAdmissionMap[b._id.toString()];
        const patientName = (adm?.patientId?.name || "").toLowerCase();
        const uhid = (adm?.patientId?.uhid || "").toLowerCase();

        return (
          bedNo.includes(q) ||
          roomNo.includes(q) ||
          wardName.includes(q) ||
          patientName.includes(q) ||
          uhid.includes(q)
        );
      }

      return true;
    });
  }, [beds, selectedWard, selectedStatus, selectedType, searchQuery, bedAdmissionMap]);

  // Group beds by Ward -> Room
  const wardHierarchy = useMemo(() => {
    const hierarchy: Record<string, {
      wardInfo: any;
      rooms: Record<string, { roomInfo: any; beds: any[] }>;
    }> = {};

    filteredBeds.forEach((b) => {
      const room = b.roomId as any;
      const ward = room?.wardId as any;
      const wardId = ward?._id || "unassigned_ward";
      const roomId = room?._id || "unassigned_room";

      if (!hierarchy[wardId]) {
        hierarchy[wardId] = {
          wardInfo: ward || { wardName: "General Inpatient Area", floor: 1 },
          rooms: {}
        };
      }

      if (!hierarchy[wardId].rooms[roomId]) {
        hierarchy[wardId].rooms[roomId] = {
          roomInfo: room || { roomNumber: "General", roomType: "GENERAL" },
          beds: []
        };
      }

      hierarchy[wardId].rooms[roomId].beds.push(b);
    });

    return hierarchy;
  }, [filteredBeds]);

  // Bed Status Counts
  const counts = useMemo(() => {
    let avail = 0;
    let occ = 0;
    let maint = 0;
    let resv = 0;
    let blk = 0;
    beds.forEach((b) => {
      if (b.status === "AVAILABLE") avail++;
      else if (b.status === "OCCUPIED") occ++;
      else if (b.status === "MAINTENANCE") maint++;
      else if (b.status === "RESERVED") resv++;
      else if (b.status === "BLOCKED") blk++;
    });
    return { avail, occ, maint, resv, blk, total: beds.length };
  }, [beds]);

  const handleBedClick = (bed: any) => {
    setSelectedBed(bed);
    setNewStatus(bed.status || "AVAILABLE");
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/bed/${selectedBed._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Bed ${selectedBed.bedNumber} updated to ${newStatus}`, "success");
        setSelectedBed(null);
        loadData();
      } else {
        toast(data.message || "Failed to update bed status", "error");
      }
    } catch (err) {
      toast("An error occurred while updating status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusVisuals = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return {
          cardBg: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 hover:border-emerald-500",
          dotColor: "bg-emerald-500",
          textColor: "text-emerald-700 dark:text-emerald-400",
          badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-300",
          label: "Available"
        };
      case "OCCUPIED":
        return {
          cardBg: "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60 hover:border-rose-500",
          dotColor: "bg-rose-500",
          textColor: "text-rose-700 dark:text-rose-400",
          badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border-rose-300",
          label: "Occupied"
        };
      case "MAINTENANCE":
        return {
          cardBg: "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 hover:border-amber-500",
          dotColor: "bg-amber-500",
          textColor: "text-amber-700 dark:text-amber-400",
          badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300",
          label: "Sanitizing"
        };
      case "RESERVED":
        return {
          cardBg: "bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/60 hover:border-blue-500",
          dotColor: "bg-blue-500",
          textColor: "text-blue-700 dark:text-blue-400",
          badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300",
          label: "Reserved"
        };
      case "BLOCKED":
      default:
        return {
          cardBg: "bg-slate-100/70 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 hover:border-slate-400",
          dotColor: "bg-slate-500",
          textColor: "text-slate-700 dark:text-slate-400",
          badgeBg: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
          label: "Blocked"
        };
    }
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
            <Layers className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            Live Hospital Bed Board & Matrix
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time interactive visual map of all hospital beds. Click any bed card to inspect or update status.
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
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            onClick={() => router.push("/wards/allocate")}
          >
            <Plus className="h-4 w-4" />
            Allocate Bed
          </Button>
        </div>
      </div>

      {/* Legend & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border rounded-xl shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-900 dark:text-white">Available:</span>
            <span className="text-emerald-600 font-mono font-bold">{counts.avail}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500" />
            <span className="font-semibold text-slate-900 dark:text-white">Occupied:</span>
            <span className="text-rose-600 font-mono font-bold">{counts.occ}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="font-semibold text-slate-900 dark:text-white">Sanitizing:</span>
            <span className="text-amber-600 font-mono font-bold">{counts.maint}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="font-semibold text-slate-900 dark:text-white">Reserved:</span>
            <span className="text-blue-600 font-mono font-bold">{counts.resv}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-slate-500" />
            <span className="font-semibold text-slate-900 dark:text-white">Blocked:</span>
            <span className="text-slate-600 font-mono font-bold">{counts.blk}</span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Total Beds: <span className="font-bold text-slate-800 dark:text-slate-200">{counts.total}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search bed, room, patient, UHID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div>
              <Select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Facility Wards</option>
                {wards.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.wardName} (Floor {w.floor})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">🟢 Available Only</option>
                <option value="OCCUPIED">🔴 Occupied Only</option>
                <option value="MAINTENANCE">🟠 Sanitizing / Maintenance</option>
                <option value="RESERVED">🟡 Reserved</option>
                <option value="BLOCKED">⚫ Blocked</option>
              </Select>
            </div>

            <div>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Bed Types</option>
                <option value="NORMAL">Normal / Standard</option>
                <option value="ELECTRIC">Electric Adjustable</option>
                <option value="ICU">ICU Critical</option>
                <option value="PEDIATRIC">Pediatric</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Visual Bed Board Grid */}
      <div className="space-y-6">
        {Object.keys(wardHierarchy).length === 0 ? (
          <Card className="p-12 text-center border">
            <BedDouble className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-900 dark:text-white">No Beds Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No beds matched the active filter criteria. Try resetting filters or adding new beds.
            </p>
          </Card>
        ) : (
          Object.entries(wardHierarchy).map(([wId, wardGroup]) => (
            <div key={wId} className="space-y-3">
              {/* Ward Header */}
              <div className="flex items-center justify-between pb-1 border-b">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {wardGroup.wardInfo.wardName}
                  </h2>
                  <Badge variant="outline" className="text-[10px]">
                    Floor {wardGroup.wardInfo.floor}
                  </Badge>
                  {wardGroup.wardInfo.wardType && (
                    <Badge variant="secondary" className="text-[10px]">
                      {wardGroup.wardInfo.wardType}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {Object.keys(wardGroup.rooms).length} Rooms Active
                </span>
              </div>

              {/* Rooms in this Ward */}
              <div className="space-y-4 pl-1 sm:pl-3">
                {Object.entries(wardGroup.rooms).map(([rId, roomGroup]) => (
                  <div key={rId} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <DoorOpen className="h-3.5 w-3.5 text-slate-400" />
                      <span>Room {roomGroup.roomInfo.roomNumber}</span>
                      <span className="text-slate-400 font-normal">
                        ({roomGroup.roomInfo.roomType})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {roomGroup.beds.length} beds
                      </span>
                    </div>

                    {/* Beds Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {roomGroup.beds.map((b) => {
                        const visuals = getStatusVisuals(b.status);
                        const adm = bedAdmissionMap[b._id.toString()];
                        return (
                          <div
                            key={b._id}
                            onClick={() => handleBedClick(b)}
                            className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md relative flex flex-col justify-between min-h-[110px] ${visuals.cardBg}`}
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className={`h-2.5 w-2.5 rounded-full ${visuals.dotColor}`} />
                                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                                    Bed {b.bedNumber}
                                  </span>
                                </div>
                                <Badge className={`text-[9px] px-1.5 py-0 ${visuals.badgeBg}`}>
                                  {visuals.label}
                                </Badge>
                              </div>

                              <div className="text-[10px] text-slate-500 mt-1">
                                {b.bedType} Bed
                              </div>
                            </div>

                            {/* Inpatient details if occupied */}
                            {adm ? (
                              <div className="mt-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px]">
                                <div className="font-bold text-slate-900 dark:text-white truncate">
                                  {adm.patientId?.name}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono truncate">
                                  {adm.patientId?.uhid || adm.patientId?.contact}
                                </div>
                                <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                                  Dr. {adm.doctorId?.name || "Attending"}
                                </div>
                              </div>
                            ) : b.status === "MAINTENANCE" ? (
                              <div className="mt-2 pt-1 border-t text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                <Wrench className="h-3 w-3" />
                                <span>Sanitizing & Cleaning</span>
                              </div>
                            ) : (
                              <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Ready for admission</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bed Status Quick-Updater Modal */}
      <Dialog open={!!selectedBed} onOpenChange={() => setSelectedBed(null)}>
        <DialogContent className="max-w-md">
          {selectedBed && (
            <form onSubmit={handleStatusUpdate}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-emerald-600" />
                  Bed {selectedBed.bedNumber} Operations
                </DialogTitle>
                <DialogDescription>
                  Room {selectedBed.roomId?.roomNumber || "N/A"} •{" "}
                  {selectedBed.roomId?.wardId?.wardName || "General Ward"} ({selectedBed.bedType} Bed)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs">
                {/* Current Occupant Preview */}
                {bedAdmissionMap[selectedBed._id.toString()] && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-1">
                    <span className="font-semibold text-rose-800 dark:text-rose-300 block">
                      Currently Occupied By:
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {bedAdmissionMap[selectedBed._id.toString()].patientId?.name}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      UHID: {bedAdmissionMap[selectedBed._id.toString()].patientId?.uhid} • Admitted:{" "}
                      {new Date(
                        bedAdmissionMap[selectedBed._id.toString()].admissionDate
                      ).toLocaleDateString()}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="statusSelect" className="text-xs font-semibold">
                    Change Operational Status
                  </Label>
                  <Select
                    id="statusSelect"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    className="h-9 text-xs"
                  >
                    <option value="AVAILABLE">🟢 Available (Ready for patient intake)</option>
                    <option value="MAINTENANCE">🟠 Maintenance / Cleaning (Sanitizing)</option>
                    <option value="OCCUPIED">🔴 Occupied (Patient assigned)</option>
                    <option value="RESERVED">🟡 Reserved (Pending intake)</option>
                    <option value="BLOCKED">⚫ Blocked (Out of service)</option>
                  </Select>
                </div>

                {selectedBed.status === "AVAILABLE" && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-teal-700 border-teal-300 hover:bg-teal-50 flex items-center justify-center gap-1.5"
                      onClick={() => {
                        const bedId = selectedBed._id;
                        setSelectedBed(null);
                        router.push(`/wards/allocate?bedId=${bedId}`);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Allocate This Bed to a Patient
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedBed(null)} disabled={updating}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Save Status
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
