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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { DoorOpen, PlusCircle, Search, Pencil, Trash2, Loader2, Building, Layers, ToggleLeft, ToggleRight } from "lucide-react";
import { useSession } from "next-auth/react";

interface RoomItem {
  _id: string;
  roomNumber: string;
  roomType: string;
  wardId: {
    _id: string;
    wardName: string;
    wardCode: string;
    floor: number;
    organizationId?: { _id: string; organizationName: string } | string;
  } | string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

interface WardOption {
  _id: string;
  wardName: string;
  wardCode: string;
  organizationId?: any;
}

function idOf(value?: string | { _id?: string } | null): string {
  return typeof value === "object" ? value?._id || "" : value || "";
}

const ROOM_TYPES = [
  { value: "GENERAL", label: "General" },
  { value: "PRIVATE", label: "Private" },
  { value: "SEMI_PRIVATE", label: "Semi Private" },
  { value: "ICU", label: "ICU" },
  { value: "ISOLATION", label: "Isolation" },
  { value: "DELUXE", label: "Deluxe" }
];

export default function ManageRoomsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create / Edit Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const [form, setForm] = useState({
    roomNumber: "",
    roomType: "GENERAL",
    wardId: "",
    description: "",
    isActive: true
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete Dialog State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoomItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sessionOrganizationId = idOf(session?.user?.organization);

  const fetchWards = useCallback(async () => {
    try {
      const url = sessionOrganizationId 
        ? `/api/ward?organizationId=${sessionOrganizationId}`
        : "/api/ward";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setWards(json.data || []);
      }
    } catch {
      console.error("Failed to load wards options");
    }
  }, [sessionOrganizationId]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/room");
      const json = await res.json();
      if (json.success) {
        // Filter rooms based on session organization if applicable
        let allRooms: RoomItem[] = json.data || [];
        if (sessionOrganizationId) {
          allRooms = allRooms.filter((r) => {
            const wardOrgId = typeof r.wardId === "object"
              ? idOf(r.wardId?.organizationId)
              : "";
            return wardOrgId === sessionOrganizationId;
          });
        }
        setRooms(allRooms);
      }
    } catch {
      toast("Failed to load rooms", "error");
    } finally {
      setLoading(false);
    }
  }, [sessionOrganizationId, toast]);

  useEffect(() => {
    fetchRooms();
    fetchWards();
  }, [fetchRooms, fetchWards]);

  const filtered = rooms.filter((r) => {
    const q = search.toLowerCase();
    return r.roomNumber.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setEditingRoom(null);
    setForm({
      roomNumber: "",
      roomType: "GENERAL",
      wardId: wards.length > 0 ? wards[0]._id : "",
      description: "",
      isActive: true
    });
    setDialogOpen(true);
  };

  const openEdit = (room: RoomItem) => {
    setEditingRoom(room);
    setForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      wardId: idOf(room.wardId),
      description: room.description || "",
      isActive: room.isActive
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roomNumber || !form.wardId) {
      toast("Please fill in all required fields", "warning");
      return;
    }

    setSaveLoading(true);
    try {
      const method = editingRoom ? "PUT" : "POST";
      const url = editingRoom ? `/api/room/${editingRoom._id}` : "/api/room";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();

      if (json.success) {
        toast(`Room ${editingRoom ? "updated" : "created"} successfully`, "success");
        setDialogOpen(false);
        fetchRooms();
      } else {
        toast(json.message || "Operation failed", "error");
      }
    } catch {
      toast("An error occurred while saving the room", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleActive = async (room: RoomItem) => {
    try {
      const res = await fetch(`/api/room/${room._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !room.isActive })
      });
      const json = await res.json();
      if (json.success) {
        toast(`Room ${!room.isActive ? "activated" : "deactivated"}`, "success");
        fetchRooms();
      } else {
        toast(json.message || "Failed to toggle status", "error");
      }
    } catch {
      toast("Error toggling room status", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/room/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast("Room deleted successfully", "success");
        setDeleteOpen(false);
        fetchRooms();
      } else {
        toast(json.message || "Delete failed", "error");
      }
    } catch {
      toast("Error deleting room", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getWardName = (ward: RoomItem["wardId"]) => {
    return typeof ward === "object" ? ward.wardName : "Unknown Ward";
  };

  const getWardFloor = (ward: RoomItem["wardId"]) => {
    return typeof ward === "object" ? ward.floor : "N/A";
  };

  const getOrgName = (ward: RoomItem["wardId"]) => {
    if (typeof ward === "object" && ward.organizationId) {
      return typeof ward.organizationId === "object" 
        ? ward.organizationId.organizationName 
        : "Assigned Org";
    }
    return "Unknown Org";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Room Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Configure and manage clinical rooms inside wards</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20">
          <PlusCircle className="h-4 w-4" />
          Add New Room
        </Button>
      </div>

      {/* Content Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <DoorOpen className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">All Rooms</CardTitle>
                <CardDescription className="text-xs font-semibold">{filtered.length} room{filtered.length !== 1 ? "s" : ""} found</CardDescription>
              </div>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by room number..."
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
              <DoorOpen className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-650 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No rooms found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Room Number</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Room Type</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Ward Name</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Floor</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Organization</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Description</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((room) => (
                  <TableRow key={room._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <TableCell className="font-semibold text-slate-900 dark:text-white font-mono">{room.roomNumber}</TableCell>
                    <TableCell>
                      <Badge variant="info" className="text-[10px] uppercase font-bold tracking-wider">
                        {room.roomType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-550 font-semibold text-sm">{getWardName(room.wardId)}</TableCell>
                    <TableCell className="text-slate-550 font-medium text-sm">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 opacity-60" />
                        {getWardFloor(room.wardId)}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-550 font-medium text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 opacity-60" />
                        {getOrgName(room.wardId)}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs max-w-xs truncate" title={room.description}>
                      {room.description || "—"}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => toggleActive(room)} title="Toggle Active Status">
                        {room.isActive ? (
                          <Badge variant="default" className="cursor-pointer gap-1 text-[10px]"><ToggleRight className="h-3 w-3" />Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="cursor-pointer gap-1 text-[10px]"><ToggleLeft className="h-3 w-3" />Inactive</Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600" onClick={() => openEdit(room)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-650" onClick={() => { setDeleteTarget(room); setDeleteOpen(true); }}>
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
            <DialogTitle className="text-lg font-bold">{editingRoom ? "Edit Room" : "Create New Room"}</DialogTitle>
            <DialogDescription className="text-xs">Provide details for the room configuration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="roomNumber" className="font-semibold text-slate-700 dark:text-slate-350">Room Number</Label>
                <Input
                  id="roomNumber"
                  placeholder="e.g. 301-A"
                  value={form.roomNumber}
                  onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
                  required
                />
              </div>

              <Select
                label="Ward"
                value={form.wardId}
                onChange={(e) => setForm((p) => ({ ...p, wardId: e.target.value }))}
                required
              >
                <option value="" disabled>Select Ward</option>
                {wards.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.wardName} ({w.wardCode})
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-4 grid-cols-1">
              <Select
                label="Room Type"
                value={form.roomType}
                onChange={(e) => setForm((p) => ({ ...p, roomType: e.target.value }))}
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="font-semibold text-slate-700 dark:text-slate-350">Description</Label>
              <Textarea
                id="description"
                placeholder="Room location details, special equipment, etc."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
              />
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
                {editingRoom ? "Save Changes" : "Create Room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Delete Room</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete room <strong>{deleteTarget?.roomNumber}</strong>? This action cannot be undone. Beds assigned to this room may become orphaned.
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
