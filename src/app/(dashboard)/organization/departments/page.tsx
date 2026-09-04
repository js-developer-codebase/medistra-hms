"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { 
  Layers, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2, 
  PhoneCall, 
  MapPin, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Stethoscope
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IDepartmentItem {
  _id: string;
  name: string;
  code: string;
  organizationId: {
    _id: string;
    organizationName: string;
  } | string;
  location?: string;
  phoneExtension?: string;
  description?: string;
  isActive?: boolean;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<IDepartmentItem[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgFilter, setSelectedOrgFilter] = useState("ALL");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<IDepartmentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    organizationId: "",
    location: "",
    phoneExtension: "",
    description: "",
  });

  const { toast } = useToast();

  const fetchDeps = async () => {
    try {
      setLoading(true);
      const [depsRes, orgsRes] = await Promise.all([
        fetch("/api/department"),
        fetch("/api/organization")
      ]);
      const depsData = await depsRes.json();
      const orgsData = await orgsRes.json();

      if (depsData.success) {
        setDepartments(depsData.data);
      }
      if (orgsData.success) {
        setOrganizations(orgsData.data);
        if (orgsData.data.length > 0 && !formData.organizationId) {
          setFormData((prev) => ({ ...prev, organizationId: orgsData.data[0]._id }));
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to fetch departments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeps();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.code || !formData.organizationId) {
      toast({ title: "Validation Error", description: "Name, Code and Organization are required", variant: "destructive" });
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
        toast({ title: "Success", description: "Department created successfully" });
        setIsDialogOpen(false);
        resetForm();
        fetchDeps();
      } else {
        toast({ title: "Creation Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to create department", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (dept: IDepartmentItem) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      organizationId: typeof dept.organizationId === "object" ? dept.organizationId?._id || "" : dept.organizationId || "",
      location: dept.location || "",
      phoneExtension: dept.phoneExtension || "",
      description: dept.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
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
        toast({ title: "Success", description: "Department updated successfully" });
        setIsEditDialogOpen(false);
        resetForm();
        fetchDeps();
      } else {
        toast({ title: "Update Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to update department", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete department: ${name}?`)) return;
    try {
      const res = await fetch(`/api/department/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Deleted", description: `${name} has been removed` });
        fetchDeps();
      } else {
        toast({ title: "Delete Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to delete department", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      organizationId: organizations[0]?._id || "",
      location: "",
      phoneExtension: "",
      description: "",
    });
    setSelectedDept(null);
  };

  const filtered = departments.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.location && d.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const orgId = typeof d.organizationId === "object" ? d.organizationId?._id : d.organizationId;
    const matchesOrg = selectedOrgFilter === "ALL" || orgId === selectedOrgFilter;

    return matchesSearch && matchesOrg;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl dark:bg-purple-950/50">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Clinical & Administrative Departments</h1>
              <p className="text-muted-foreground text-sm">
                Medical Specialty Wings, Diagnostic Suites, Emergency Casualty, and Support Services
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchDeps} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Department
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-purple-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Registered Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{departments.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Clinical and diagnostic specialties</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Active Hospital Facilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{organizations.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Facilities hosting specialty wings</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Intercom Extensions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
              <PhoneCall className="w-4 h-4" /> 24x7 Direct Hospital Paging
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Connected across IP-PBX network</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search departments by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-xs text-muted-foreground shrink-0">Filter by Facility:</Label>
          <select
            className="flex h-9 w-full sm:w-64 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={selectedOrgFilter}
            onChange={(e) => setSelectedOrgFilter(e.target.value)}
          >
            <option value="ALL">All Network Facilities ({organizations.length})</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.organizationName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Departments Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Hospital / Facility</TableHead>
                <TableHead>Location & Floor</TableHead>
                <TableHead>Extension</TableHead>
                <TableHead>Clinical Scope</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <RefreshCw className="animate-spin w-5 h-5 mx-auto text-primary" />
                    <span className="text-xs text-muted-foreground mt-2 block">Loading clinical departments...</span>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    No departments found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((dept) => {
                  const orgName =
                    typeof dept.organizationId === "object"
                      ? dept.organizationId?.organizationName
                      : organizations.find((o) => o._id === dept.organizationId)?.organizationName || "Medistra Main Campus";

                  return (
                    <TableRow key={dept._id}>
                      <TableCell>
                        <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                          {dept.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs font-semibold">
                          {dept.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{orgName}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          {dept.location || "Ground Floor - Block A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          Ext: {dept.phoneExtension || "101"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {dept.description || "Inpatient and outpatient clinical care"}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditOpen(dept)}
                          title="Edit Department"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(dept._id, dept.name)}
                          title="Delete Department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Department Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Clinical Department</DialogTitle>
            <DialogDescription>
              Register a clinical specialty or administrative unit for a hospital facility.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-1.5">
              <Label>Hospital / Facility</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={formData.organizationId}
                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
              >
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.organizationName} ({org.organizationId})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Department Name</Label>
                <Input
                  placeholder="e.g. Oncology & Chemotherapy"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Department Code</Label>
                <Input
                  placeholder="e.g. ONCO"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Building Floor & Wing Location</Label>
                <Input
                  placeholder="e.g. 4th Floor - Block B"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Internal Extension Number</Label>
                <Input
                  placeholder="e.g. 401"
                  value={formData.phoneExtension}
                  onChange={(e) => setFormData({ ...formData, phoneExtension: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Department Description & Scope</Label>
              <Input
                placeholder="Comprehensive care, day surgery, OPD and round-the-clock emergency"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Save Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update location, extension, or clinical scope for {selectedDept?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Department Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Department Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Extension</Label>
                <Input
                  value={formData.phoneExtension}
                  onChange={(e) => setFormData({ ...formData, phoneExtension: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
              Update Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
