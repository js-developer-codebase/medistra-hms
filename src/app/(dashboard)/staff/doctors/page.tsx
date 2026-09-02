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
  UserPlus,
  Search,
  Stethoscope,
  Building2,
  CheckCircle2,
  Calendar,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Phone,
  Mail,
  DollarSign,
  MapPin,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

interface DoctorItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    gender?: string;
    isActive: boolean;
  };
  departmentId?: {
    _id: string;
    name: string;
    code: string;
    location?: string;
  };
  licenseNo: string;
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  roomNumber?: string;
  bio?: string;
  phone?: string;
  status?: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    gender: "MALE",
    password: "",
    departmentId: "",
    licenseNo: "",
    specialization: "",
    qualification: "",
    experienceYears: 5,
    consultationFee: 500,
    roomNumber: "OPD-101",
    bio: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "ON_LEAVE",
  };
  const [formData, setFormData] = useState(initialFormState);

  const { toast } = useToast();

  async function fetchDoctors() {
    try {
      setLoading(true);
      const [docRes, deptRes] = await Promise.all([
        fetch("/api/doctor"),
        fetch("/api/department"),
      ]);
      const docData = await docRes.json();
      const deptData = await deptRes.json();

      if (docData.success) {
        setDoctors(docData.data || []);
      }
      if (deptData.success) {
        setDepartments(deptData.data || []);
        if (deptData.data.length > 0 && !formData.departmentId) {
          setFormData((prev) => ({ ...prev, departmentId: deptData.data[0]._id }));
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load doctors.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = search.toLowerCase();
      const name = doc.userId?.name?.toLowerCase() || "";
      const email = doc.userId?.email?.toLowerCase() || "";
      const license = doc.licenseNo?.toLowerCase() || "";
      const spec = doc.specialization?.toLowerCase() || "";
      const dept = doc.departmentId?.name?.toLowerCase() || "";

      const matchesSearch =
        name.includes(q) ||
        email.includes(q) ||
        license.includes(q) ||
        spec.includes(q) ||
        dept.includes(q);

      const matchesDept =
        selectedDept === "ALL" ||
        doc.departmentId?._id === selectedDept ||
        doc.departmentId?.name === selectedDept;

      const currentStatus = doc.status || (doc.userId?.isActive ? "ACTIVE" : "INACTIVE");
      const matchesStatus = selectedStatus === "ALL" || currentStatus === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [doctors, search, selectedDept, selectedStatus]);

  // Quick stats
  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter(
    (d) => (d.status || (d.userId?.isActive ? "ACTIVE" : "INACTIVE")) === "ACTIVE"
  ).length;
  const onLeaveDoctors = doctors.filter((d) => d.status === "ON_LEAVE").length;
  const uniqueDeptsCount = new Set(doctors.map((d) => d.departmentId?._id).filter(Boolean)).size;

  // Handle Create Doctor
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.departmentId || !formData.licenseNo) {
      toast({
        title: "Validation Error",
        description: "Name, Email, Department, and License No. are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Doctor added successfully." });
        setIsAddOpen(false);
        setFormData(initialFormState);
        fetchDoctors();
      } else {
        toast({ title: "Error", description: data.message || "Failed to create doctor.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Edit Doctor
  function openEdit(doc: DoctorItem) {
    setSelectedDoctor(doc);
    setFormData({
      name: doc.userId?.name || "",
      email: doc.userId?.email || "",
      phone: doc.phone || doc.userId?.phone || "",
      gender: (doc.userId?.gender as any) || "MALE",
      password: "",
      departmentId: doc.departmentId?._id || "",
      licenseNo: doc.licenseNo || "",
      specialization: doc.specialization || "",
      qualification: doc.qualification || "",
      experienceYears: doc.experienceYears || 0,
      consultationFee: doc.consultationFee || 0,
      roomNumber: doc.roomNumber || "",
      bio: doc.bio || "",
      status: doc.status || "ACTIVE",
    });
    setIsEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDoctor) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/doctor/${selectedDoctor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isActive: formData.status === "ACTIVE",
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Doctor updated successfully." });
        setIsEditOpen(false);
        setSelectedDoctor(null);
        fetchDoctors();
      } else {
        toast({ title: "Error", description: data.message || "Failed to update doctor.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update doctor.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Delete Doctor
  async function handleDelete() {
    if (!selectedDoctor) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/doctor/${selectedDoctor._id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Doctor Removed", description: "Doctor has been deleted." });
        setIsDeleteOpen(false);
        setSelectedDoctor(null);
        fetchDoctors();
      } else {
        toast({ title: "Error", description: data.message || "Failed to delete.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Error deleting doctor.", variant: "destructive" });
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
            Doctors Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage hospital medical staff, specializations, credentials, and OPD consultations.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialFormState);
            setIsAddOpen(true);
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <UserPlus className="h-4 w-4" /> Add Doctor
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Doctors</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalDoctors}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active & Available</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeDoctors}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">On Leave</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{onLeaveDoctors}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Departments</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{uniqueDeptsCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Medical Staff Roster</CardTitle>
              <CardDescription>
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </CardDescription>
            </div>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search doctor, license, spec..."
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
                <option value="ON_LEAVE">On Leave</option>
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
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Stethoscope className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm">No doctors found matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Room / License</TableHead>
                    <TableHead>Consultation Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doc) => {
                    const status = doc.status || (doc.userId?.isActive ? "ACTIVE" : "INACTIVE");
                    return (
                      <TableRow key={doc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Dr. {doc.userId?.name || "Doctor"}</span>
                            {doc.qualification && (
                              <span className="text-[11px] font-normal text-slate-500">
                                ({doc.qualification})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {doc.userId?.email || "N/A"}
                            </span>
                            {(doc.phone || doc.userId?.phone) && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {doc.phone || doc.userId?.phone}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary" className="font-medium text-xs">
                            {doc.specialization || "General Medicine"}
                          </Badge>
                          {doc.experienceYears ? (
                            <span className="block text-[11px] text-slate-500 mt-0.5">
                              {doc.experienceYears} yrs exp.
                            </span>
                          ) : null}
                        </TableCell>

                        <TableCell>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {doc.departmentId?.name || "General"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {doc.roomNumber || "OPD"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Lic: {doc.licenseNo}
                          </div>
                        </TableCell>

                        <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                          ₹{doc.consultationFee || 0}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              status === "ACTIVE"
                                ? "default"
                                : status === "ON_LEAVE"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {status === "ACTIVE"
                              ? "Active"
                              : status === "ON_LEAVE"
                              ? "On Leave"
                              : "Inactive"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-emerald-600"
                              title="View Profile"
                              onClick={() => {
                                setSelectedDoctor(doc);
                                setIsDetailOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-blue-600"
                              title="Edit Doctor"
                              onClick={() => openEdit(doc)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-red-600"
                              title="Delete Doctor"
                              onClick={() => {
                                setSelectedDoctor(doc);
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD DOCTOR DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Register a physician or medical consultant into the hospital system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Doctor Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Email Address *</Label>
                <Input
                  required
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Contact Phone</Label>
                <Input
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Gender</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Temporary Password</Label>
                <Input
                  type="password"
                  placeholder="Defaults to doctor123"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Department *</Label>
                <select
                  required
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

              <div className="space-y-1.5">
                <Label>License Number *</Label>
                <Input
                  required
                  placeholder="e.g. MCI-2024-8899"
                  value={formData.licenseNo}
                  onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Specialization</Label>
                <Input
                  placeholder="e.g. Interventional Cardiology"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Qualifications</Label>
                <Input
                  placeholder="e.g. MBBS, MD, DM (Cardiology)"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Experience (Years)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Consultation Fee (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>OPD Room / Clinic</Label>
                <Input
                  placeholder="e.g. Room 204"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Doctor Bio / Clinical Focus</Label>
              <textarea
                className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Summary of experience, research, clinical achievements..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Doctor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DOCTOR DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor Profile</DialogTitle>
            <DialogDescription>Update doctor details, department, fees, and status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Doctor Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input
                  disabled
                  value={formData.email}
                  className="bg-slate-100 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Specialization</Label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Qualifications</Label>
                <Input
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Experience (Years)</Label>
                <Input
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Consultation Fee (₹)</Label>
                <Input
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>OPD Room</Label>
                <Input
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Bio / Notes</Label>
              <textarea
                className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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

      {/* DOCTOR DETAILS MODAL */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          {selectedDoctor && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-lg">
                    {selectedDoctor.userId?.name?.charAt(0) || "D"}
                  </div>
                  <div>
                    <DialogTitle className="text-lg">Dr. {selectedDoctor.userId?.name}</DialogTitle>
                    <DialogDescription>
                      {selectedDoctor.specialization || "General Specialist"} • {selectedDoctor.departmentId?.name}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 py-2 text-sm border-y border-slate-100 dark:border-slate-800">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">License Number</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDoctor.licenseNo}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Qualification</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedDoctor.qualification || "MBBS / MD"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Experience</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedDoctor.experienceYears || 0} Years</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Consultation Fee</span>
                  <span className="font-bold text-emerald-600">₹{selectedDoctor.consultationFee || 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">OPD Room</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedDoctor.roomNumber || "OPD Room 1"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedDoctor.userId?.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedDoctor.phone || selectedDoctor.userId?.phone || "N/A"}</span>
                </div>
                {selectedDoctor.bio && (
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Bio / Background</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {selectedDoctor.bio}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex sm:justify-between items-center gap-2">
                <Link href="/staff/schedule" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full gap-2 text-xs">
                    <Calendar className="h-3.5 w-3.5" /> View Doctor Schedule
                  </Button>
                </Link>
                <Button onClick={() => setIsDetailOpen(false)} className="w-full sm:w-auto">
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Doctor</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove Dr. <strong>{selectedDoctor?.userId?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
