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
  Hospital, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  BedDouble, 
  RefreshCw, 
  ShieldCheck, 
  Building2,
  CheckCircle2,
  XCircle
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

interface IHospitalItem {
  _id: string;
  organizationName: string;
  organizationId: string;
  organizationType: string;
  branchType: string;
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

export default function HospitalsManagementPage() {
  const [hospitals, setHospitals] = useState<IHospitalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<IHospitalItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    organizationName: "",
    organizationId: "",
    branchType: "BRANCH",
    email: "",
    phone: "",
    address: "",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700001",
    country: "India",
    capacity: 150,
  });

  const { toast } = useToast();

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/organization/hospitals");
      const data = await res.json();
      if (data.success) {
        setHospitals(data.data);
      } else {
        toast({ title: "Error", description: data.message || "Failed to fetch hospitals", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to fetch hospitals", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleCreate = async () => {
    if (!formData.organizationName || !formData.organizationId) {
      toast({ title: "Validation Error", description: "Name and Identifier are required", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/organization/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Hospital registered successfully" });
        setIsDialogOpen(false);
        resetForm();
        fetchHospitals();
      } else {
        toast({ title: "Creation Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to create hospital", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (hosp: IHospitalItem) => {
    setSelectedHospital(hosp);
    setFormData({
      organizationName: hosp.organizationName,
      organizationId: hosp.organizationId,
      branchType: hosp.branchType,
      email: hosp.email || "",
      phone: hosp.phone || "",
      address: hosp.address || "",
      city: hosp.city || "Kolkata",
      state: hosp.state || "West Bengal",
      pincode: hosp.pincode || "700001",
      country: "India",
      capacity: hosp.capacity || 100,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedHospital) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/organization/hospitals/${selectedHospital._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Hospital details updated successfully" });
        setIsEditDialogOpen(false);
        resetForm();
        fetchHospitals();
      } else {
        toast({ title: "Update Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to update hospital", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from network records?`)) return;
    try {
      const res = await fetch(`/api/organization/hospitals/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Deleted", description: `${name} has been removed` });
        fetchHospitals();
      } else {
        toast({ title: "Delete Failed", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to delete hospital", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      organizationName: "",
      organizationId: "",
      branchType: "BRANCH",
      email: "",
      phone: "",
      address: "",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700001",
      country: "India",
      capacity: 150,
    });
    setSelectedHospital(null);
  };

  const filtered = hospitals.filter((h) =>
    h.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.organizationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.city && h.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalBeds = hospitals.reduce((acc, h) => acc + (h.capacity || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl dark:bg-emerald-950/50">
              <Hospital className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Hospitals & Medical Centers</h1>
              <p className="text-muted-foreground text-sm">
                Tertiary & Quaternary Healthcare Facilities, Inpatient Beds, and Clinical Capacity
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchHospitals} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Register Hospital
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Registered Hospital Centers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{hospitals.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Flagship and specialty branches</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Inpatient Operational Beds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalBeds.toLocaleString("en-IN")} Beds</div>
            <p className="text-xs text-muted-foreground mt-0.5">Cumulative operational capacity</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Regulatory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4" /> 100% NABH Certified
            </div>
            <p className="text-xs text-muted-foreground mt-1">Compliant with National Standards</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search hospitals by name, ID, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Hospitals Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital Center</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Bed Strength</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <RefreshCw className="animate-spin w-5 h-5 mx-auto text-primary" />
                    <span className="text-xs text-muted-foreground mt-2 block">Loading hospital network...</span>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    No hospitals found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((hosp) => (
                  <TableRow key={hosp._id}>
                    <TableCell>
                      <div className="font-semibold text-foreground text-sm">{hosp.organizationName}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{hosp.address}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {hosp.organizationId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={hosp.branchType === "MAIN" ? "default" : "outline"} className="text-[10px] uppercase">
                        {hosp.branchType === "MAIN" ? "Central Flagship" : "Regional Sub"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {hosp.city || "Kolkata"}, {hosp.state || "West Bengal"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="text-foreground font-medium">{hosp.phone || "N/A"}</div>
                      <div className="text-muted-foreground">{hosp.email || "N/A"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-semibold text-xs">
                        <BedDouble className="w-3 h-3 mr-1 text-emerald-600" />
                        {hosp.capacity || 0} Beds
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {hosp.isActive ? (
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
                        onClick={() => handleEditOpen(hosp)}
                        title="Edit Hospital"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(hosp._id, hosp.organizationName)}
                        title="Delete Hospital"
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

      {/* Add Hospital Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Register Hospital Center</DialogTitle>
            <DialogDescription>
              Add a new tertiary or specialized hospital facility to the healthcare network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Hospital Name</Label>
                <Input
                  placeholder="e.g. Medistra South Campus"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Hospital Code / Identifier</Label>
                <Input
                  placeholder="e.g. MEDISTRA-SOUTH-03"
                  value={formData.organizationId}
                  onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Campus Classification</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={formData.branchType}
                  onChange={(e) => setFormData({ ...formData, branchType: e.target.value })}
                >
                  <option value="BRANCH">Regional Specialty Branch</option>
                  <option value="MAIN">Primary Flagship Campus</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Operational Bed Capacity</Label>
                <Input
                  type="number"
                  placeholder="150"
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
                  placeholder="south@medistra.hospital"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input
                  placeholder="+91 33 2400 1100"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Facility Address</Label>
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
              Save Hospital
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hospital Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Hospital Center</DialogTitle>
            <DialogDescription>
              Update operational parameters and contact details for {selectedHospital?.organizationName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Hospital Name</Label>
                <Input
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Operational Bed Capacity</Label>
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
              Update Hospital
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
