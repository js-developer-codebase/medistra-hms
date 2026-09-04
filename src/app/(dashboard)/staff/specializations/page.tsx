"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Activity,
  Plus,
  Search,
  Stethoscope,
  Building2,
  CheckCircle2,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";

interface SpecializationItem {
  _id: string;
  name: string;
  code: string;
  departmentId?: {
    _id: string;
    name: string;
    code: string;
  };
  description?: string;
  doctorCount?: number;
  isActive: boolean;
}

export default function StaffSpecializationsPage() {
  const [specializations, setSpecializations] = useState<SpecializationItem[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<SpecializationItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    name: "",
    code: "",
    departmentId: "",
    description: "",
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  const { toast } = useToast();

  async function fetchSpecializations() {
    try {
      setLoading(true);
      const [specRes, deptRes] = await Promise.all([
        fetch("/api/staff/specializations"),
        fetch("/api/department"),
      ]);
      const specJson = await specRes.json();
      const deptJson = await deptRes.json();

      if (specJson.success) setSpecializations(specJson.data || []);
      if (deptJson.success) setDepartments(deptJson.data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load specializations.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const filtered = useMemo(() => {
    return specializations.filter((s) => {
      const q = search.toLowerCase();
      const name = s.name.toLowerCase();
      const code = s.code.toLowerCase();
      const dept = s.departmentId?.name?.toLowerCase() || "";
      const desc = s.description?.toLowerCase() || "";

      const matchesSearch = name.includes(q) || code.includes(q) || dept.includes(q) || desc.includes(q);
      const matchesDept = selectedDept === "ALL" || s.departmentId?._id === selectedDept;
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "ACTIVE" && s.isActive) ||
        (selectedStatus === "INACTIVE" && !s.isActive);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [specializations, search, selectedDept, selectedStatus]);

  // Quick stats
  const totalSpecs = specializations.length;
  const activeSpecs = specializations.filter((s) => s.isActive).length;
  const totalDocs = specializations.reduce((acc, s) => acc + (s.doctorCount || 0), 0);
  const uniqueDepts = new Set(specializations.map((s) => s.departmentId?._id).filter(Boolean)).size;

  // Create
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast({ title: "Validation Error", description: "Name and Code are required.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/staff/specializations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Specialization added successfully." });
        setIsAddOpen(false);
        setFormData(initialFormState);
        fetchSpecializations();
      } else {
        toast({ title: "Error", description: data.message || "Failed to create.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Edit
  function openEdit(spec: SpecializationItem) {
    setSelectedSpec(spec);
    setFormData({
      name: spec.name,
      code: spec.code,
      departmentId: spec.departmentId?._id || "",
      description: spec.description || "",
      isActive: spec.isActive,
    });
    setIsEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSpec) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/staff/specializations/${selectedSpec._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Specialization updated successfully." });
        setIsEditOpen(false);
        setSelectedSpec(null);
        fetchSpecializations();
      } else {
        toast({ title: "Error", description: data.message || "Failed to update.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Delete
  async function handleDelete() {
    if (!selectedSpec) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/staff/specializations/${selectedSpec._id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Deleted", description: "Specialization has been deleted." });
        setIsDeleteOpen(false);
        setSelectedSpec(null);
        fetchSpecializations();
      } else {
        toast({ title: "Error", description: data.message || "Failed to delete.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete specialization.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Medical Specializations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Catalog of medical sub-disciplines, clinical procedures, and specialist doctor registries.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialFormState);
            setIsAddOpen(true);
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4" /> Add Specialization
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Specializations</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalSpecs}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Specialties</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeSpecs}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Departments Linked</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{uniqueDepts}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Specialist Doctors</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalDocs}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Specializations Registry</CardTitle>
              <CardDescription>
                Showing {filtered.length} of {specializations.length} specializations
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search specialization or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Sparkles className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm">No medical specializations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Specialization Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Associated Department</TableHead>
                    <TableHead>Practicing Doctors</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((spec) => (
                    <TableRow key={spec._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {spec.name}
                        </div>
                        {spec.description && (
                          <div className="text-xs text-slate-500 max-w-sm truncate">
                            {spec.description}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs font-semibold">
                          {spec.code}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {spec.departmentId?.name || "General Medicine"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium">{spec.doctorCount || 0} Doctors</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={spec.isActive ? "default" : "secondary"}>
                          {spec.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-blue-600"
                            onClick={() => openEdit(spec)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => {
                              setSelectedSpec(spec);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medical Specialization</DialogTitle>
            <DialogDescription>Register a new clinical branch or physician specialty.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Specialization Name *</Label>
              <Input
                required
                placeholder="e.g. Interventional Cardiology, Pediatric Oncology"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input
                  required
                  placeholder="e.g. INT-CARD"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Department</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description / Focus Areas</Label>
              <Input
                placeholder="Conditions treated, surgical techniques, diagnostics..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Specialization
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Specialization</DialogTitle>
            <DialogDescription>Modify specialization title, department, or description.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Specialization Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Department</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={formData.isActive ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Specialization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedSpec?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
