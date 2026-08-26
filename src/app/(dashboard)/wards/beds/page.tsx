"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { BedDouble, PlusCircle, Search, Pencil, Trash2, Loader2, Building, ToggleLeft, ToggleRight, CheckSquare, Settings } from "lucide-react";
import { useSession } from "next-auth/react";

interface BedItem {
  _id: string;
  bedNumber: string;
  roomId: {
    _id: string;
    roomNumber: string;
    roomType: string;
    wardId?: {
      _id: string;
      wardName: string;
      wardCode: string;
      floor: number;
      organizationId?: { _id: string; organizationName: string } | string;
    } | string;
  } | string;
  bedType: string;
  status: string;
  isActive: boolean;
  createdAt?: string;
}

interface RoomOption {
  _id: string;
  roomNumber: string;
  wardId?: any;
}

function idOf(value?: string | { _id?: string } | null): string {
  return typeof value === "object" ? value?._id || "" : value || "";
}

const BED_TYPES = [
  { value: "NORMAL", label: "Normal" },
  { value: "ELECTRIC", label: "Electric" },
  { value: "ICU", label: "ICU" },
  { value: "PEDIATRIC", label: "Pediatric" }
];

const BED_STATUSES = [
  { value: "AVAILABLE", label: "Available" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "RESERVED", label: "Reserved" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "BLOCKED", label: "Blocked" }
];

export default function ManageBedsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [beds, setBeds] = useState<BedItem[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create / Edit Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<BedItem | null>(null);
  const [form, setForm] = useState({
    bedNumber: "",
    roomId: "",
    bedType: "NORMAL",
    status: "AVAILABLE",
    isActive: true
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete Dialog State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BedItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sessionOrganizationId = idOf(session?.user?.organization);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/room");
      const json = await res.json();
      if (json.success) {
        let allRooms: RoomOption[] = json.data || [];
        if (sessionOrganizationId) {
          allRooms = allRooms.filter((r) => {
            const wardOrgId = r.wardId && typeof r.wardId === "object"
              ? idOf(r.wardId?.organizationId)
              : "";
            return !wardOrgId || wardOrgId === sessionOrganizationId;
          });
        }
        setRooms(allRooms);
      }
    } catch {
      console.error("Failed to load rooms options");
    }
  }, [sessionOrganizationId]);

  const fetchBeds = useCallback(async () => {
    try {
      const res = await fetch("/api/bed");
      const json = await res.json();
      if (json.success) {
        let allBeds: BedItem[] = json.data || [];
        if (sessionOrganizationId) {
          allBeds = allBeds.filter((b) => {
            if (typeof b.roomId === "object" && b.roomId.wardId) {
              const wardOrgId = typeof b.roomId.wardId === "object"
                ? idOf(b.roomId.wardId.organizationId)
                : "";
              return wardOrgId === sessionOrganizationId;
            }
            return true;
          });
        }
        setBeds(allBeds);
      }
    } catch {
      toast("Failed to load beds", "error");
    } finally {
      setLoading(false);
    }
  }, [sessionOrganizationId, toast]);

  useEffect(() => {
    fetchBeds();
    fetchRooms();
  }, [fetchBeds, fetchRooms]);

  const filtered = beds.filter((b) => {
    const q = search.toLowerCase();
    return b.bedNumber.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setEditingBed(null);
    setForm({
      bedNumber: "",
      roomId: rooms.length > 0 ? rooms[0]._id : "",
      bedType: "NORMAL",
      status: "AVAILABLE",
      isActive: true
    });
    setDialogOpen(true);
  };

  const openEdit = (bed: BedItem) => {
    setEditingBed(bed);
    setForm({
      bedNumber: bed.bedNumber,
      roomId: idOf(bed.roomId),
      bedType: bed.bedType,
      status: bed.status,
      isActive: bed.isActive
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bedNumber || !form.roomId) {
      toast("Please fill in all required fields", "warning");
      return;
    }

    setSaveLoading(true);
    try {
      const method = editingBed ? "PUT" : "POST";
      const url = editingBed ? `/api/bed/${editingBed._id}` : "/api/bed";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();

      if (json.success) {
        toast(`Bed ${editingBed ? "updated" : "created"} successfully`, "success");
        setDialogOpen(false);
        fetchBeds();
      } else {
        toast(json.message || "Operation failed", "error");
      }
    } catch {
      toast("An error occurred while saving the bed", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleActive = async (bed: BedItem) => {
    try {
      const res = await fetch(`/api/bed/${bed._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !bed.isActive })
      });
      const json = await res.json();
      if (json.success) {
        toast(`Bed ${!bed.isActive ? "activated" : "deactivated"}`, "success");
        fetchBeds();
      } else {
        toast(json.message || "Failed to toggle status", "error");
      }
    } catch {
      toast("Error toggling bed status", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/bed/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast("Bed deleted successfully", "success");
        setDeleteOpen(false);
        fetchBeds();
      } else {
        toast(json.message || "Delete failed", "error");
      }
    } catch {
      toast("Error deleting bed", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoomNumber = (room: BedItem["roomId"]) => {
    return typeof room === "object" ? room.roomNumber : "Unknown Room";
  };

  const getWardName = (room: BedItem["roomId"]) => {
    if (typeof room === "object" && room.wardId) {
      return typeof room.wardId === "object" ? room.wardId.wardName : "Assigned Ward";
    }
    return "Unknown Ward";
  };

  const getOrgName = (room: BedItem["roomId"]) => {
    if (typeof room === "object" && room.wardId && typeof room.wardId === "object" && room.wardId.organizationId) {
      return typeof room.wardId.organizationId === "object"
        ? room.wardId.organizationId.organizationName
        : "Assigned Org";
    }
    return "Unknown Org";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20">Available</Badge>;
      case "OCCUPIED":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-450 border-red-500/20">Occupied</Badge>;
      case "RESERVED":
        return <Badge variant="warning" className="bg-amber-500/10 text-amber-600 dark:text-amber-455 border-amber-500/20">Reserved</Badge>;
      case "MAINTENANCE":
        return <Badge variant="secondary" className="bg-slate-500/10 text-slate-600 dark:text-slate-450 border-slate-500/20">Maintenance</Badge>;
      case "BLOCKED":
        return <Badge variant="outline" className="bg-red-950/20 text-red-400 border-red-800/30">Blocked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Bed Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Configure and manage clinical beds and availability status</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20">
          <PlusCircle className="h-4 w-4" />
          Add New Bed
        </Button>
      </div>

      {/* Content Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <BedDouble className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">All Beds</CardTitle>
                <CardDescription className="text-xs font-semibold">{filtered.length} bed{filtered.length !== 1 ? "s" : ""} found</CardDescription>
              </div>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by bed number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <BedDouble className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-650 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No beds found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Bed Number</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Bed Type</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Room Number</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Ward Name</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Organization</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Active</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((bed) => (
                  <TableRow key={bed._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <TableCell className="font-semibold text-slate-900 dark:text-white font-mono">{bed.bedNumber}</TableCell>
                    <TableCell>
                      <Badge variant="info" className="text-[10px] uppercase font-bold tracking-wider">
                        {bed.bedType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-550 font-semibold text-sm font-mono">{getRoomNumber(bed.roomId)}</TableCell>
                    <TableCell className="text-slate-550 font-semibold text-sm">{getWardName(bed.roomId)}</TableCell>
                    <TableCell className="text-slate-550 font-medium text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 opacity-60" />
                        {getOrgName(bed.roomId)}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(bed.status)}</TableCell>
                    <TableCell>
                      <button onClick={() => toggleActive(bed)} title="Toggle Active Status">
                        {bed.isActive ? (
                          <Badge variant="default" className="cursor-pointer gap-1 text-[10px]"><ToggleRight className="h-3 w-3" />Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="cursor-pointer gap-1 text-[10px]"><ToggleLeft className="h-3 w-3" />Inactive</Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600" onClick={() => openEdit(bed)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-650" onClick={() => { setDeleteTarget(bed); setDeleteOpen(true); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{editingBed ? "Edit Bed" : "Create New Bed"}</DialogTitle>
            <DialogDescription className="text-xs">Provide details for the bed configuration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bedNumber" className="font-semibold text-slate-700 dark:text-slate-350">Bed Number</Label>
                <Input
                  id="bedNumber"
                  placeholder="e.g. B1-301"
                  value={form.bedNumber}
                  onChange={(e) => setForm((p) => ({ ...p, bedNumber: e.target.value }))}
                  required
                />
              </div>

              <Select
                label="Room"
                value={form.roomId}
                onChange={(e) => setForm((p) => ({ ...p, roomId: e.target.value }))}
                required
              >
                <option value="" disabled>Select Room</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    Room {r.roomNumber}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-4 grid-cols-2">
              <Select
                label="Bed Type"
                value={form.bedType}
                onChange={(e) => setForm((p) => ({ ...p, bedType: e.target.value }))}
              >
                {BED_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>

              <Select
                label="Availability Status"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                {BED_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Label className="cursor-pointer font-semibold text-slate-755 dark:text-slate-350">Active Status</Label>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                className="focus:outline-none"
              >
                {form.isActive ? (
                  <Badge variant="default" className="gap-1"><ToggleRight className="h-4 w-4" />Active</Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1"><ToggleLeft className="h-4 w-4" />Inactive</Badge>
                )}
              </button>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={saveLoading} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                {saveLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {editingBed ? "Save Changes" : "Create Bed"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Delete Bed</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete bed <strong>{deleteTarget?.bedNumber}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading} className="text-xs gap-2">
              {deleteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
