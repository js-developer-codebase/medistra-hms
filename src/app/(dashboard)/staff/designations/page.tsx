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
  Award,
  Plus,
  Search,
  Users,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

interface DesignationItem {
  _id: string;
  name: string;
  code: string;
  department?: string;
  level?: string;
  description?: string;
  staffCount?: number;
  isActive: boolean;
}

const CATEGORIES = ["Medical", "Nursing", "Pharmacy", "Laboratory", "Radiology", "Administration", "Finance", "General"];
const LEVELS = ["Senior", "Mid-Level", "Junior", "Executive"];

export default function StaffDesignationsPage() {
  const [designations, setDesignations] = useState<DesignationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDesig, setSelectedDesig] = useState<DesignationItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    name: "",
    code: "",
    department: "Nursing",
    level: "Mid-Level",
    description: "",
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  const { toast } = useToast();

  async function fetchDesignations() {
    try {
      setLoading(true);
      const res = await fetch("/api/staff/designations");
      const data = await res.json();
      if (data.success) {
        setDesignations(data.data || []);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load designations.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDesignations();
  }, []);

  const filtered = useMemo(() => {
    return designations.filter((d) => {
      const q = search.toLowerCase();
      const name = d.name.toLowerCase();
      const code = d.code.toLowerCase();
      const dept = d.department?.toLowerCase() || "";
      const desc = d.description?.toLowerCase() || "";

      const matchesSearch = name.includes(q) || code.includes(q) || dept.includes(q) || desc.includes(q);
      const matchesCategory = selectedCategory === "ALL" || d.department === selectedCategory;
      const matchesLevel = selectedLevel === "ALL" || d.level === selectedLevel;
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "ACTIVE" && d.isActive) ||
        (selectedStatus === "INACTIVE" && !d.isActive);

      return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
    });
  }, [designations, search, selectedCategory, selectedLevel, selectedStatus]);

  // Quick stats
  const totalDesignations = designations.length;
  const activeDesignations = designations.filter((d) => d.isActive).length;
  const seniorRoles = designations.filter((d) => d.level === "Senior").length;
  const totalAssignedStaff = designations.reduce((acc, d) => acc + (d.staffCount || 0), 0);

  // Create
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast({ title: "Validation Error", description: "Title and Code are required.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/staff/designations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Designation added successfully." });
        setIsAddOpen(false);
        setFormData(initialFormState);
        fetchDesignations();
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
  function openEdit(desig: DesignationItem) {
    setSelectedDesig(desig);
    setFormData({
      name: desig.name,
      code: desig.code,
      department: desig.department || "General",
      level: desig.level || "Mid-Level",
      description: desig.description || "",
      isActive: desig.isActive,
    });
    setIsEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDesig) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/staff/designations/${selectedDesig._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Designation updated successfully." });
        setIsEditOpen(false);
        setSelectedDesig(null);
        fetchDesignations();
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
    if (!selectedDesig) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/staff/designations/${selectedDesig._id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Deleted", description: "Designation has been deleted." });
        setIsDeleteOpen(false);
        setSelectedDesig(null);
        fetchDesignations();
      } else {
        toast({ title: "Error", description: data.message || "Failed to delete.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete designation.", variant: "destructive" });
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
            Hospital Designations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define job titles, seniority levels, job roles, and hospital organizational hierarchy.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialFormState);
            setIsAddOpen(true);
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4" /> Add Designation
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Designations</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalDesignations}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Titles</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeDesignations}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Senior Grades</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{seniorRoles}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Staff Assigned</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalAssignedStaff}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Designations Directory</CardTitle>
              <CardDescription>
                Showing {filtered.length} of {designations.length} job titles
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search title or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="ALL">All Seniority</option>
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
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
              <Award className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm">No designations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Designation Title</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Seniority Level</TableHead>
                    <TableHead>Staff Assigned</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((desig) => (
                    <TableRow key={desig._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {desig.name}
                        </div>
                        {desig.description && (
                          <div className="text-xs text-slate-500 max-w-sm truncate">
                            {desig.description}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs font-semibold">
                          {desig.code}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {desig.department || "General"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            desig.level === "Senior"
                              ? "default"
                              : desig.level === "Mid-Level"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {desig.level || "Mid-Level"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium">{desig.staffCount || 0} members</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={desig.isActive ? "default" : "secondary"}>
                          {desig.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-blue-600"
                            onClick={() => openEdit(desig)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => {
                              setSelectedDesig(desig);
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
            <DialogTitle>Add Hospital Designation</DialogTitle>
            <DialogDescription>Define a new professional title or role level in the hospital.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Designation Title *</Label>
              <Input
                required
                placeholder="e.g. Senior Consultant Cardiologist"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input
                  required
                  placeholder="e.g. SR-CONS"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Seniority Level</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Role Description</Label>
              <Input
                placeholder="Job description, duties, prerequisites..."
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
                Save Designation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Designation</DialogTitle>
            <DialogDescription>Modify title, department, or seniority level.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Designation Title</Label>
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
                <Label>Category</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Seniority Level</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
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
            <DialogTitle>Delete Designation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedDesig?.name}</strong>?
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
