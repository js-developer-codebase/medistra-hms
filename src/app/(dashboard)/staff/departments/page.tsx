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
  Building2,
  Plus,
  Search,
  Stethoscope,
  Users,
  MapPin,
  Phone,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface DepartmentItem {
  _id: string;
  name: string;
  code: string;
  location?: string;
  phoneExtension?: string;
  description?: string;
  headOfDepartment?: {
    _id: string;
    name: string;
    email?: string;
  };
  doctorCount?: number;
  staffCount?: number;
  isActive: boolean;
}

export default function StaffDepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    name: "",
    code: "",
    location: "Block A - 1st Floor",
    phoneExtension: "1001",
    description: "",
    headOfDepartment: "",
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  const { toast } = useToast();

  async function fetchDepartments() {
    try {
      setLoading(true);
      const [deptRes, docRes] = await Promise.all([
        fetch("/api/department"),
        fetch("/api/doctor"),
      ]);
      const deptData = await deptRes.json();
      const docData = await docRes.json();

      if (deptData.success) setDepartments(deptData.data || []);
      if (docData.success) setDoctors(docData.data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load departments.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepts = useMemo(() => {
    return departments.filter((d) => {
      const q = search.toLowerCase();
      const name = d.name?.toLowerCase() || "";
      const code = d.code?.toLowerCase() || "";
      const loc = d.location?.toLowerCase() || "";
      const desc = d.description?.toLowerCase() || "";

      const matchesSearch =
        name.includes(q) || code.includes(q) || loc.includes(q) || desc.includes(q);

      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "ACTIVE" && d.isActive) ||
        (selectedStatus === "INACTIVE" && !d.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, selectedStatus]);

  // Quick stats
  const totalDepts = departments.length;
  const activeDepts = departments.filter((d) => d.isActive).length;
  const totalAssignedDocs = departments.reduce((acc, d) => acc + (d.doctorCount || 0), 0);
  const totalAssignedStaff = departments.reduce((acc, d) => acc + (d.staffCount || 0), 0);

  // Create Department
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast({ title: "Validation Error", description: "Name and Code are required.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Department created successfully." });
        setIsAddOpen(false);
        setFormData(initialFormState);
        fetchDepartments();
      } else {
        toast({ title: "Error", description: data.message || "Failed to create department.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Edit Department
  function openEdit(dept: DepartmentItem) {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      location: dept.location || "",
      phoneExtension: dept.phoneExtension || "",
      description: dept.description || "",
      headOfDepartment: dept.headOfDepartment?._id || "",
      isActive: dept.isActive,
    });
    setIsEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDept) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/department/${selectedDept._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Department updated successfully." });
        setIsEditOpen(false);
        setSelectedDept(null);
        fetchDepartments();
      } else {
        toast({ title: "Error", description: data.message || "Failed to update department.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update department.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Delete Department
  async function handleDelete() {
    if (!selectedDept) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/department/${selectedDept._id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Department Removed", description: "Department has been deleted." });
        setIsDeleteOpen(false);
        setSelectedDept(null);
        fetchDepartments();
      } else {
        toast({ title: "Error", description: data.message || "Failed to delete.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete department.", variant: "destructive" });
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
            Hospital Departments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Clinical specialties, wards, support divisions, locations, and personnel assignments.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialFormState);
            setIsAddOpen(true);
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Departments</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalDepts}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Divisions</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeDepts}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Assigned Doctors</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalAssignedDocs}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Assigned Staff</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalAssignedStaff}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Departments Roster</CardTitle>
              <CardDescription>
                Showing {filteredDepts.length} of {departments.length} departments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search department or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
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
          ) : filteredDepts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Building2 className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm">No departments found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Location & Ext.</TableHead>
                    <TableHead>Head of Department</TableHead>
                    <TableHead>Personnel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepts.map((dept) => (
                    <TableRow key={dept._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {dept.name}
                        </div>
                        {dept.description && (
                          <div className="text-xs text-slate-500 max-w-xs truncate">
                            {dept.description}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs font-semibold uppercase">
                          {dept.code}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {dept.location || "Main Building"}
                        </div>
                        {dept.phoneExtension && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            Ext: {dept.phoneExtension}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {dept.headOfDepartment?.name || "Pending Assignment"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="default" className="text-[11px] font-normal gap-1">
                            <Stethoscope className="h-3 w-3" /> {dept.doctorCount || 0} Docs
                          </Badge>
                          <Badge variant="secondary" className="text-[11px] font-normal gap-1">
                            <Users className="h-3 w-3" /> {dept.staffCount || 0} Staff
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={dept.isActive ? "default" : "secondary"}>
                          {dept.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-blue-600"
                            onClick={() => openEdit(dept)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => {
                              setSelectedDept(dept);
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

      {/* ADD MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Hospital Department</DialogTitle>
            <DialogDescription>Create a new clinical specialty or administrative department.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Department Name *</Label>
              <Input
                required
                placeholder="e.g. CARDIOLOGY, NEUROLOGY, ONCOLOGY"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input
                  required
                  placeholder="e.g. CARD"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Extension</Label>
                <Input
                  placeholder="e.g. 1021"
                  value={formData.phoneExtension}
                  onChange={(e) => setFormData({ ...formData, phoneExtension: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Physical Location / Floor</Label>
              <Input
                placeholder="e.g. Block A - 2nd Floor"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Head of Department (HOD)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={formData.headOfDepartment}
                onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              >
                <option value="">Select Doctor / HOD (Optional)</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc.userId?._id || doc._id}>
                    Dr. {doc.userId?.name || "Doctor"} ({doc.specialization || "Specialist"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Description / Scope</Label>
              <Input
                placeholder="Specialty services provided..."
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
                Save Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update department details, location, and status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Department Name</Label>
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
                <Label>Extension</Label>
                <Input
                  value={formData.phoneExtension}
                  onChange={(e) => setFormData({ ...formData, phoneExtension: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Location / Wing</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
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

      {/* DELETE MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedDept?.name}</strong>?
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
