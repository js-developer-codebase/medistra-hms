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
  IndianRupee,
  Users,
  Pencil,
  Download,
  RefreshCw,
  Loader2,
  ShieldCheck,
  GraduationCap
} from "lucide-react";

interface DesignationItem {
  _id: string;
  name: string;
  code: string;
  department: string;
  level: string;
  description?: string;
  salaryMin: number;
  salaryMax: number;
  requirements: string;
  employeeCount: number;
}

const LEVELS = ["Junior", "Mid-Level", "Senior", "Executive"];
const DEPARTMENTS = ["Medical", "Nursing", "Pharmacy", "Laboratory", "Radiology", "Administration", "Finance", "General"];

export default function HRDesignationsPage() {
  const [designations, setDesignations] = useState<DesignationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const { toast } = useToast();

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDesig, setSelectedDesig] = useState<DesignationItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    department: "Nursing",
    level: "Mid-Level",
    description: "",
    salaryMin: "30000",
    salaryMax: "65000",
    requirements: "B.Sc Nursing / Diploma in Healthcare"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/designations");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDesignations(json.data);
      }
    } catch (err) {
      console.error("Failed to load designations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return designations.filter((d) => {
      const q = search.toLowerCase();
      const matchesSearch = !search || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.department.toLowerCase().includes(q);
      const matchesLevel = selectedLevel === "ALL" || d.level === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [designations, search, selectedLevel]);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      code: `DSG-${Math.floor(100 + Math.random() * 900)}`,
      department: "Nursing",
      level: "Mid-Level",
      description: "Clinical patient care role",
      salaryMin: "35000",
      salaryMax: "70000",
      requirements: "Registered Nurse / Healthcare Degree"
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (d: DesignationItem) => {
    setSelectedDesig(d);
    setFormData({
      name: d.name,
      code: d.code,
      department: d.department || "General",
      level: d.level || "Mid-Level",
      description: d.description || "",
      salaryMin: String(d.salaryMin || 25000),
      salaryMax: String(d.salaryMax || 60000),
      requirements: d.requirements || ""
    });
    setIsEditOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hr/designations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Designation created successfully!" });
        setIsAddOpen(false);
        fetchData();
      } else {
        toast({ title: "Error", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create designation", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDesig) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/hr/designations/${selectedDesig._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salaryMin: Number(formData.salaryMin),
          salaryMax: Number(formData.salaryMax),
          level: formData.level,
          requirements: formData.requirements
        })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Pay band updated successfully!" });
        setIsEditOpen(false);
        fetchData();
      } else {
        toast({ title: "Error", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update pay band", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Code", "Designation Name", "Department", "Grade Level", "Min Pay (INR)", "Max Pay (INR)", "Requirements", "Headcount"];
    const rows = filtered.map((d) => [
      `"${d.code}"`,
      `"${d.name}"`,
      `"${d.department}"`,
      `"${d.level}"`,
      `"${d.salaryMin}"`,
      `"${d.salaryMax}"`,
      `"${d.requirements}"`,
      `"${d.employeeCount}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hr_designations_pay_bands_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Award className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Designations & Compensation Pay Bands
              </h1>
              <p className="text-sm text-muted-foreground">
                Hospital organizational grade structures, minimum-maximum salary scales in ₹, prerequisite qualifications, and active staffing.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" onClick={handleOpenAdd} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            Add Designation
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search designation, code, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Grade Levels</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Designations Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Hospital Position & Grade Hierarchy</CardTitle>
          <CardDescription className="text-xs">
            Configured pay bands and minimum entry prerequisites across medical, nursing, and administrative branches
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Designation Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Pay Band Scale (Monthly INR)</TableHead>
                  <TableHead>Prerequisites / Credentials</TableHead>
                  <TableHead className="text-center">Active Headcount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                        Loading designations...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      No designations found matching search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => (
                    <TableRow key={d._id} className="hover:bg-muted/30 text-xs">
                      <TableCell className="font-mono font-bold text-foreground">
                        {d.code}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">{d.name}</div>
                        {d.description && <div className="text-[11px] text-muted-foreground">{d.description}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {d.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            d.level === "Executive"
                              ? "bg-violet-500/10 text-violet-600 border-violet-500/20"
                              : d.level === "Senior"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          }`}
                        >
                          {d.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-medium text-foreground">
                        ₹{d.salaryMin.toLocaleString("en-IN")} – ₹{d.salaryMax.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[220px] truncate">
                        {d.requirements}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          {d.employeeCount} Staff
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700"
                          onClick={() => handleOpenEdit(d)}
                        >
                          <Pencil className="h-4 w-4" />
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

      {/* ADD DESIGNATION DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Hospital Designation</DialogTitle>
            <DialogDescription>Define a new clinical or administrative role with compensation pay band in ₹.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAdd} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label>Designation Title *</Label>
              <Input
                required
                placeholder="e.g. Senior ICU Registrar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Role Code *</Label>
                <Input
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="uppercase"
                />
              </div>
              <div className="space-y-1">
                <Label>Grade Level *</Label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Department Division *</Label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Minimum Pay (₹) *</Label>
                <Input
                  required
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label>Maximum Pay (₹) *</Label>
                <Input
                  required
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Minimum Prerequisite Credentials</Label>
              <Input
                placeholder="e.g. MD / MBBS with 3 yrs experience"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-700 text-white">
                {submitting ? "Creating..." : "Create Designation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT PAY BAND DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Pay Band Scale</DialogTitle>
            <DialogDescription>
              Adjust monthly salary scale range in ₹ for {selectedDesig?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label>Grade Level</Label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Minimum Pay Scale (₹)</Label>
                <Input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label>Maximum Pay Scale (₹)</Label>
                <Input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Prerequisite Qualifications</Label>
              <Input
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-700 text-white">
                {submitting ? "Updating..." : "Save Pay Band"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
