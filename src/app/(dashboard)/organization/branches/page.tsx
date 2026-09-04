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
  Network, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  RefreshCw, 
  Building2, 
  Sliders,
  CheckCircle2,
  XCircle,
  ExternalLink
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

interface IBranchItem {
  _id: string;
  organizationName: string;
  organizationId: string;
  organizationType: string;
  branchType: string;
  headQuarter?: {
    _id: string;
    organizationName: string;
  } | string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  capacity?: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export default function OrganizationBranchesPage() {
  const [branches, setBranches] = useState<IBranchItem[]>([]);
  const [headquarters, setHeadquarters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<IBranchItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    organizationName: "",
    organizationId: "",
    organizationType: "CLINIC",
    headQuarter: "",
    email: "",
    phone: "",
    address: "",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700064",
    country: "India",
    capacity: 20,
  });

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [branchesRes, orgsRes] = await Promise.all([
        fetch("/api/organization/branches"),
        fetch("/api/organization")
      ]);
      const branchesData = await branchesRes.json();
      const orgsData = await orgsRes.json();

      if (branchesData.success) {
        setBranches(branchesData.data);
      }
      if (orgsData.success) {
        const mains = orgsData.data.filter((o: any) => o.branchType === "MAIN");
        setHeadquarters(mains);
        if (mains.length > 0 && !formData.headQuarter) {
          setFormData((prev) => ({ ...prev, headQuarter: mains[0]._id }));
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to fetch branches", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!formData.organizationName || !formData.organizationId) {
      toast({ title: "Validation Error", description: "Name and Branch ID are required", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/organization/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Satellite Branch created successfully" });
        setIsDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast({ title: "Creation Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to create branch", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (branch: IBranchItem) => {
    setSelectedBranch(branch);
    setFormData({
      organizationName: branch.organizationName,
      organizationId: branch.organizationId,
      organizationType: branch.organizationType,
      headQuarter: typeof branch.headQuarter === "object" ? branch.headQuarter?._id || "" : branch.headQuarter || "",
      email: branch.email || "",
      phone: branch.phone || "",
      address: branch.address || "",
      city: branch.city || "Kolkata",
      state: branch.state || "West Bengal",
      pincode: branch.pincode || "700064",
      country: "India",
      capacity: branch.capacity || 20,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedBranch) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/organization/branches/${selectedBranch._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Branch updated successfully" });
        setIsEditDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast({ title: "Update Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to update branch", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete satellite branch: ${name}?`)) return;
    try {
      const res = await fetch(`/api/organization/branches/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Deleted", description: `${name} has been removed` });
        fetchData();
      } else {
        toast({ title: "Delete Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to delete branch", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      organizationName: "",
      organizationId: "",
      organizationType: "CLINIC",
      headQuarter: headquarters[0]?._id || "",
      email: "",
      phone: "",
      address: "",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700064",
      country: "India",
      capacity: 20,
    });
    setSelectedBranch(null);
  };

  const filtered = branches.filter((b) =>
    b.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.organizationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.city && b.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl dark:bg-indigo-950/50">
              <Network className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Branches & Satellite Clinics</h1>
              <p className="text-muted-foreground text-sm">
                Satellite Polyclinics, Diagnostic Collection Centers, Daycare Theatres & Outpost Units
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/organization/branch-settings">
            <Button variant="outline" size="sm">
              <Clock className="w-4 h-4 mr-2 text-cyan-600" /> Logistics & Timings
            </Button>
          </Link>
          <Button size="sm" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Branch
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-indigo-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Satellite Branches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{branches.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Polyclinics and diagnostic suites</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Consultation & Day Care Beds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {branches.reduce((acc, b) => acc + (b.capacity || 0), 0)} Units
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Observation and OPD chambers</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Parent Headquarters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-blue-600 truncate mt-1">
              {headquarters[0]?.organizationName || "Medistra Healthcare System"}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Central Logistics Synchronization</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search branches by name, ID, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Branches Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch / Polyclinic</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Facility Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Chambers / Beds</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <RefreshCw className="animate-spin w-5 h-5 mx-auto text-primary" />
                    <span className="text-xs text-muted-foreground mt-2 block">Loading satellite branches...</span>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    No satellite branches found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((branch) => (
                  <TableRow key={branch._id}>
                    <TableCell>
                      <div className="font-semibold text-foreground text-sm">{branch.organizationName}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{branch.address}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {branch.organizationId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                        {branch.organizationType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {branch.city || "Kolkata"}, {branch.state || "West Bengal"}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-foreground">
                        {branch.capacity || 0} Rooms / Beds
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="text-foreground font-medium">{branch.phone || "N/A"}</div>
                      <div className="text-muted-foreground">{branch.email || "N/A"}</div>
                    </TableCell>
                    <TableCell>
                      {branch.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditOpen(branch)}
                        title="Edit Branch"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(branch._id, branch.organizationName)}
                        title="Delete Branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Branch Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Satellite Branch</DialogTitle>
            <DialogDescription>
              Create a new clinic, diagnostic, or day surgery outpost linked to headquarters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-1.5">
              <Label>Parent Flagship Organization</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={formData.headQuarter}
                onChange={(e) => setFormData({ ...formData, headQuarter: e.target.value })}
              >
                {headquarters.map((hq) => (
                  <option key={hq._id} value={hq._id}>
                    {hq.organizationName} ({hq.organizationId})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Branch Name</Label>
                <Input
                  placeholder="e.g. Medistra Polyclinic - Behala"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Branch Identifier Code</Label>
                <Input
                  placeholder="e.g. MEDISTRA-BH-03"
                  value={formData.organizationId}
                  onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Facility Classification</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={formData.organizationType}
                  onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                >
                  <option value="CLINIC">Polyclinic & Outpatient</option>
                  <option value="DIAGNOSTIC">Diagnostic & Imaging</option>
                  <option value="PHARMACY">Retail Pharmacy Hub</option>
                  <option value="HOSPITAL">Day Care Hospital</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Consultation Chambers / Daycare Beds</Label>
                <Input
                  type="number"
                  placeholder="15"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  placeholder="branch@medistra.hospital"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input
                  placeholder="+91 33 2450 8899"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Location Address</Label>
              <Input
                placeholder="Street address, block, area..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Save Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Satellite Branch</DialogTitle>
            <DialogDescription>
              Update operational parameters for {selectedBranch?.organizationName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Branch Name</Label>
                <Input
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Chambers / Beds</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Facility Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
              Update Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
