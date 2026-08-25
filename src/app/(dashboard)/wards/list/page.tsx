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
import { Layout, PlusCircle, Search, Pencil, Trash2, Loader2, Building, Layers, ToggleLeft, ToggleRight } from "lucide-react";
import { useSession } from "next-auth/react";

interface WardItem {
  _id: string;
  wardName: string;
  wardCode: string;
  wardType: string;
  floor: number;
  organizationId: { _id: string; organizationName: string } | string;
  isActive: boolean;
  createdAt?: string;
}

interface OrganizationOption {
  _id: string;
  organizationName: string;
  branchType: "MAIN" | "BRANCH";
}

function idOf(value?: string | { _id?: string } | null): string {
  return typeof value === "object" ? value?._id || "" : value || "";
}

const WARD_TYPES = [
  { value: "GENERAL", label: "General" },
  { value: "ICU", label: "ICU" },
  { value: "CCU", label: "CCU" },
  { value: "NICU", label: "NICU" },
  { value: "PICU", label: "PICU" },
  { value: "MATERNITY", label: "Maternity" },
  { value: "PEDIATRIC", label: "Pediatric" },
  { value: "PRIVATE", label: "Private" },
  { value: "SEMI_PRIVATE", label: "Semi Private" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "OTHER", label: "Other" }
];

export default function ManageWardsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [wards, setWards] = useState<WardItem[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create / Edit Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<WardItem | null>(null);
  const [form, setForm] = useState({
    wardName: "",
    wardCode: "",
    wardType: "GENERAL",
    floor: 0,
    organizationId: "",
    isActive: true
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete Dialog State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WardItem | null>(null);
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
      toast("Failed to load wards", "error");
    } finally {
      setLoading(false);
    }
  }, [sessionOrganizationId, toast]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const res = await fetch("/api/org");
      const json = await res.json();
      if (json.success) {
        setOrganizations(json.data || []);
      }
    } catch {
      console.error("Failed to load organizations");
    }
  }, []);

  useEffect(() => {
    fetchWards();
    fetchOrganizations();
  }, [fetchWards, fetchOrganizations]);

  // Set default organization in form when session changes or dialog opens
  useEffect(() => {
    if (sessionOrganizationId && !form.organizationId) {
      setForm((prev) => ({ ...prev, organizationId: sessionOrganizationId }));
    }
  }, [sessionOrganizationId, form.organizationId]);

  const filtered = wards.filter((w) => {
    const q = search.toLowerCase();
    return (
      w.wardName.toLowerCase().includes(q) ||
      w.wardCode.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingWard(null);
    setForm({
      wardName: "",
      wardCode: "",
      wardType: "GENERAL",
      floor: 0,
      organizationId: sessionOrganizationId || "",
      isActive: true
    });
    setDialogOpen(true);
  };

  const openEdit = (ward: WardItem) => {
    setEditingWard(ward);
    setForm({
      wardName: ward.wardName,
      wardCode: ward.wardCode,
      wardType: ward.wardType,
      floor: ward.floor,
      organizationId: idOf(ward.organizationId),
      isActive: ward.isActive
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.wardName || !form.wardCode || !form.organizationId) {
      toast("Please fill in all required fields", "warning");
      return;
    }

    setSaveLoading(true);
    try {
      const method = editingWard ? "PUT" : "POST";
      const url = editingWard ? `/api/ward/${editingWard._id}` : "/api/ward";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();

      if (json.success) {
        toast(`Ward ${editingWard ? "updated" : "created"} successfully`, "success");
        setDialogOpen(false);
        fetchWards();
      } else {
        toast(json.message || "Operation failed", "error");
      }
    } catch {
      toast("An error occurred while saving the ward", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleActive = async (ward: WardItem) => {
    try {
      const res = await fetch(`/api/ward/${ward._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !ward.isActive })
      });
      const json = await res.json();
      if (json.success) {
        toast(`Ward ${!ward.isActive ? "activated" : "deactivated"}`, "success");
        fetchWards();
      } else {
        toast(json.message || "Failed to toggle status", "error");
      }
    } catch {
      toast("Error toggling ward status", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/ward/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast("Ward deleted successfully", "success");
        setDeleteOpen(false);
        fetchWards();
      } else {
        toast(json.message || "Delete failed", "error");
      }
    } catch {
      toast("Error deleting ward", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getOrgName = (org: WardItem["organizationId"]) => {
    return typeof org === "object" ? org.organizationName : "Unknown Organization";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Ward Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Configure and manage clinical wards</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20">
          <PlusCircle className="h-4 w-4" />
          Add New Ward
        </Button>
      </div>

      {/* Content Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Layout className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">All Wards</CardTitle>
                <CardDescription className="text-xs font-semibold">{filtered.length} ward{filtered.length !== 1 ? "s" : ""} found</CardDescription>
              </div>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or code..."
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
              <Layout className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-650 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No wards found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Ward Name</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Ward Code</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Ward Type</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Floor</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Organization</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ward) => (
                  <TableRow key={ward._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <TableCell className="font-semibold text-slate-900 dark:text-white">{ward.wardName}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 font-semibold">{ward.wardCode}</TableCell>
                    <TableCell>
                      <Badge variant="info" className="text-[10px] uppercase font-bold tracking-wider">
                        {ward.wardType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-550 font-medium text-sm">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 opacity-60" />
                        {ward.floor}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-550 font-medium text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 opacity-60" />
                        {getOrgName(ward.organizationId)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => toggleActive(ward)} title="Toggle Active Status">
                        {ward.isActive ? (
                          <Badge variant="default" className="cursor-pointer gap-1 text-[10px]"><ToggleRight className="h-3 w-3" />Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="cursor-pointer gap-1 text-[10px]"><ToggleLeft className="h-3 w-3" />Inactive</Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600" onClick={() => openEdit(ward)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-650" onClick={() => { setDeleteTarget(ward); setDeleteOpen(true); }}>
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
            <DialogTitle className="text-lg font-bold">{editingWard ? "Edit Ward" : "Create New Ward"}</DialogTitle>
            <DialogDescription className="text-xs">Provide details for the ward configuration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="wardName" className="font-semibold text-slate-700 dark:text-slate-350">Ward Name</Label>
              <Input
                id="wardName"
                placeholder="e.g. Cardiology General Ward"
                value={form.wardName}
                onChange={(e) => setForm((p) => ({ ...p, wardName: e.target.value }))}
                required
              />
            </div>
            
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="wardCode" className="font-semibold text-slate-700 dark:text-slate-350">Ward Code</Label>
                <Input
                  id="wardCode"
                  placeholder="e.g. CARD-GEN"
                  value={form.wardCode}
                  onChange={(e) => setForm((p) => ({ ...p, wardCode: e.target.value.toUpperCase() }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="floor" className="font-semibold text-slate-700 dark:text-slate-350">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  placeholder="Floor number"
                  value={form.floor}
                  onChange={(e) => setForm((p) => ({ ...p, floor: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-2">
              <Select
                label="Ward Type"
                value={form.wardType}
                onChange={(e) => setForm((p) => ({ ...p, wardType: e.target.value }))}
              >
                {WARD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>

              <Select
                label="Organization"
                value={form.organizationId}
                onChange={(e) => setForm((p) => ({ ...p, organizationId: e.target.value }))}
                disabled={Boolean(sessionOrganizationId)}
              >
                <option value="">Select Organization</option>
                {organizations
                  .filter((org) => org.branchType === "MAIN")
                  .map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.organizationName}
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
                {editingWard ? "Save Changes" : "Create Ward"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Delete Ward</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete ward <strong>{deleteTarget?.wardName}</strong>? This action cannot be undone. Rooms and beds belonging to this ward may become orphaned or restricted.
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
