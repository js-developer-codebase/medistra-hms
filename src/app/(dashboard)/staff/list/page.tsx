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
  Users,
  HeartPulse,
  Briefcase,
  Clock,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface StaffItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    gender?: string;
    isActive: boolean;
  };
  employeeId: string;
  departmentId?: {
    _id: string;
    name: string;
    code: string;
    location?: string;
  };
  designationId?: {
    _id: string;
    name: string;
    code: string;
    level?: string;
  };
  role: string;
  qualification?: string;
  joiningDate?: string;
  shift: "MORNING" | "EVENING" | "NIGHT" | "ROTATING";
  phone?: string;
  emergencyContact?: string;
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
}

const HOSPITAL_ROLES = [
  { value: "NURSE", label: "Nurse" },
  { value: "NURSE_MANAGER", label: "Nursing Supervisor" },
  { value: "PHARMACIST", label: "Pharmacist" },
  { value: "LAB_TECHNICIAN", label: "Lab Technician" },
  { value: "RADIOLOGY_TECHNICIAN", label: "Radiology Technician" },
  { value: "RECEPTIONIST", label: "Receptionist / Front Desk" },
  { value: "BILLING_OFFICER", label: "Billing Officer" },
  { value: "STOREKEEPER", label: "Inventory / Storekeeper" },
  { value: "HR_OFFICER", label: "HR Officer" },
  { value: "HOSPITAL_ADMIN", label: "Hospital Admin" },
];

export default function StaffListPage() {
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedShift, setSelectedShift] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    gender: "FEMALE",
    password: "",
    employeeId: "",
    role: "NURSE",
    departmentId: "",
    designationId: "",
    qualification: "",
    shift: "MORNING" as "MORNING" | "EVENING" | "NIGHT" | "ROTATING",
    joiningDate: new Date().toISOString().split("T")[0],
    emergencyContact: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "ON_LEAVE",
  };
  const [formData, setFormData] = useState(initialFormState);

  const { toast } = useToast();

  async function fetchStaffData() {
    try {
      setLoading(true);
      const [staffRes, deptRes, desigRes] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/department"),
        fetch("/api/staff/designations"),
      ]);
      const staffJson = await staffRes.json();
      const deptJson = await deptRes.json();
      const desigJson = await desigRes.json();

      if (staffJson.success) setStaffList(staffJson.data || []);
      if (deptJson.success) setDepartments(deptJson.data || []);
      if (desigJson.success) setDesignations(desigJson.data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load staff records.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const q = search.toLowerCase();
      const name = s.userId?.name?.toLowerCase() || "";
      const email = s.userId?.email?.toLowerCase() || "";
      const empId = s.employeeId?.toLowerCase() || "";
      const role = s.role?.toLowerCase() || "";
      const dept = s.departmentId?.name?.toLowerCase() || "";
      const desig = s.designationId?.name?.toLowerCase() || "";

      const matchesSearch =
        name.includes(q) ||
        email.includes(q) ||
        empId.includes(q) ||
        role.includes(q) ||
        dept.includes(q) ||
        desig.includes(q);

      const matchesRole = selectedRole === "ALL" || s.role === selectedRole;
      const matchesDept = selectedDept === "ALL" || s.departmentId?._id === selectedDept;
      const matchesShift = selectedShift === "ALL" || s.shift === selectedShift;
      const currentStatus = s.status || (s.userId?.isActive ? "ACTIVE" : "INACTIVE");
      const matchesStatus = selectedStatus === "ALL" || currentStatus === selectedStatus;

      return matchesSearch && matchesRole && matchesDept && matchesShift && matchesStatus;
    });
  }, [staffList, search, selectedRole, selectedDept, selectedShift, selectedStatus]);

  // Quick stats
  const totalStaff = staffList.length;
  const clinicalStaff = staffList.filter((s) => {
    const r = (s.role || "").toUpperCase();
    return r.includes("NURSE") || r.includes("PHARM") || r.includes("LAB") || r.includes("RADIOL");
  }).length;
  const adminStaff = totalStaff - clinicalStaff;
  const activeStaff = staffList.filter(
    (s) => (s.status || (s.userId?.isActive ? "ACTIVE" : "INACTIVE")) === "ACTIVE"
  ).length;

  // Create Staff
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Validation Error",
        description: "Name, Email, and Role are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Staff member added successfully." });
        setIsAddOpen(false);
        setFormData(initialFormState);
        fetchStaffData();
      } else {
        toast({ title: "Error", description: data.message || "Failed to create staff.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to add staff member.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Edit Staff
  function openEdit(s: StaffItem) {
    setSelectedStaff(s);
    setFormData({
      name: s.userId?.name || "",
      email: s.userId?.email || "",
      phone: s.phone || s.userId?.phone || "",
      gender: (s.userId?.gender as any) || "FEMALE",
      password: "",
      employeeId: s.employeeId || "",
      role: s.role || "NURSE",
      departmentId: s.departmentId?._id || "",
      designationId: s.designationId?._id || "",
      qualification: s.qualification || "",
      shift: s.shift || "MORNING",
      joiningDate: s.joiningDate ? s.joiningDate.split("T")[0] : "",
      emergencyContact: s.emergencyContact || "",
      status: s.status || "ACTIVE",
    });
    setIsEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStaff) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/staff/${selectedStaff._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isActive: formData.status === "ACTIVE",
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Staff updated successfully." });
        setIsEditOpen(false);
        setSelectedStaff(null);
        fetchStaffData();
      } else {
        toast({ title: "Error", description: data.message || "Failed to update staff.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update staff.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  // Delete Staff
  async function handleDelete() {
    if (!selectedStaff) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/staff/${selectedStaff._id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Staff Removed", description: "Staff member has been removed." });
        setIsDeleteOpen(false);
        setSelectedStaff(null);
        fetchStaffData();
      } else {
        toast({ title: "Error", description: data.message || "Failed to delete.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Error deleting staff member.", variant: "destructive" });
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
            Staff Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hospital nursing, technical, administrative, and clinical support roster.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialFormState);
            setIsAddOpen(true);
          }}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <UserPlus className="h-4 w-4" /> Add Staff Member
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Staff Roster</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalStaff}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Clinical & Nursing</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{clinicalStaff}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Admin & Support</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{adminStaff}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Staff</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeStaff}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Staff Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Staff Personnel Directory</CardTitle>
              <CardDescription>
                Showing {filteredStaff.length} of {staffList.length} staff members
              </CardDescription>
            </div>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search staff, emp ID, role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                {HOSPITAL_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

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
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
              >
                <option value="ALL">All Shifts</option>
                <option value="MORNING">Morning Shift</option>
                <option value="EVENING">Evening Shift</option>
                <option value="NIGHT">Night Shift</option>
                <option value="ROTATING">Rotating Shift</option>
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
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm">No staff members found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role & Designation</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => {
                    const status = staff.status || (staff.userId?.isActive ? "ACTIVE" : "INACTIVE");
                    return (
                      <TableRow key={staff._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {staff.userId?.name || "Staff Member"}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {staff.employeeId}
                            </span>
                            <span>• {staff.userId?.gender || "N/A"}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="info" className="font-medium text-xs">
                            {staff.role}
                          </Badge>
                          <span className="block text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {staff.designationId?.name || "Staff"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {staff.departmentId?.name || "General"}
                          </span>
                          {staff.departmentId?.location && (
                            <span className="block text-[11px] text-slate-400">
                              {staff.departmentId.location}
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {staff.shift}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {staff.userId?.email || "N/A"}
                          </div>
                          {(staff.phone || staff.userId?.phone) && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {staff.phone || staff.userId?.phone}
                            </div>
                          )}
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
                                setSelectedStaff(staff);
                                setIsDetailOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-blue-600"
                              title="Edit Staff"
                              onClick={() => openEdit(staff)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-red-600"
                              title="Delete Staff"
                              onClick={() => {
                                setSelectedStaff(staff);
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

      {/* ADD STAFF MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Hospital Staff</DialogTitle>
            <DialogDescription>
              Register a new staff member (nursing, laboratory, pharmacy, or administrative).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Email Address *</Label>
                <Input
                  required
                  type="email"
                  placeholder="sarah.j@hospital.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
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
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Defaults to staff123"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Role *</Label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {HOSPITAL_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
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

              <div className="space-y-1.5">
                <Label>Designation</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.designationId}
                  onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                >
                  <option value="">Select Designation</option>
                  {designations.map((desig) => (
                    <option key={desig._id} value={desig._id}>
                      {desig.name} ({desig.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Employee ID</Label>
                <Input
                  placeholder="Auto-generated if empty"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Work Shift</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                >
                  <option value="MORNING">Morning (07:00 - 15:00)</option>
                  <option value="EVENING">Evening (15:00 - 23:00)</option>
                  <option value="NIGHT">Night (23:00 - 07:00)</option>
                  <option value="ROTATING">Rotating Shift</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Joining Date</Label>
                <Input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Qualifications / Certifications</Label>
                <Input
                  placeholder="e.g. B.Sc Nursing / Diploma in Pharmacy"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Emergency Contact</Label>
                <Input
                  placeholder="e.g. Spouse: +91 9123456780"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Staff Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT STAFF MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update staff information, department, shift, or employment status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input disabled value={formData.email} className="bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {HOSPITAL_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
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

              <div className="space-y-1.5">
                <Label>Designation</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.designationId}
                  onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                >
                  <option value="">Select Designation</option>
                  {designations.map((desig) => (
                    <option key={desig._id} value={desig._id}>
                      {desig.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Work Shift</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                >
                  <option value="MORNING">Morning Shift</option>
                  <option value="EVENING">Evening Shift</option>
                  <option value="NIGHT">Night Shift</option>
                  <option value="ROTATING">Rotating Shift</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Employment Status</Label>
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
                <Label>Qualifications</Label>
                <Input
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Emergency Contact</Label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>
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

      {/* DETAIL MODAL */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          {selectedStaff && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-lg">
                    {selectedStaff.userId?.name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{selectedStaff.userId?.name}</DialogTitle>
                    <DialogDescription>
                      {selectedStaff.designationId?.name || selectedStaff.role} • {selectedStaff.departmentId?.name}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 py-2 text-sm border-y border-slate-100 dark:border-slate-800">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Employee ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedStaff.employeeId}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Role</span>
                  <Badge variant="info">{selectedStaff.role}</Badge>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Shift</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedStaff.shift}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Qualification</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedStaff.qualification || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedStaff.userId?.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedStaff.phone || selectedStaff.userId?.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Emergency Contact</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedStaff.emergencyContact || "N/A"}</span>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setIsDetailOpen(false)} className="w-full">
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selectedStaff?.userId?.name}</strong> ({selectedStaff?.employeeId})?
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
