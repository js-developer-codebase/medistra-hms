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
  Users,
  UserPlus,
  Search,
  Building2,
  Award,
  IndianRupee,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Download,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw,
  Filter
} from "lucide-react";

interface EmployeeItem {
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
  salary?: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  address?: string;
}

const ROLES = ["NURSE", "PHARMACIST", "LAB_TECHNICIAN", "RADIOLOGIST", "RECEPTIONIST", "BILLING_OFFICER", "ADMIN", "OTHER"];
const SHIFTS = ["MORNING", "EVENING", "NIGHT", "ROTATING"];
const STATUSES = ["ACTIVE", "INACTIVE", "ON_LEAVE"];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const { toast } = useToast();

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "OTHER",
    employeeId: "",
    departmentId: "",
    designationId: "",
    role: "NURSE",
    qualification: "",
    shift: "MORNING",
    phone: "",
    emergencyContact: "",
    status: "ACTIVE",
    salary: "35000",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    panNumber: "",
    aadhaarNumber: "",
    address: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, desigRes] = await Promise.all([
        fetch("/api/hr/employees").then((r) => r.json()).catch(() => ({})),
        fetch("/api/department").then((r) => r.json()).catch(() => ({})),
        fetch("/api/staff/designations").then((r) => r.json()).catch(() => ({}))
      ]);

      if (empRes.success && Array.isArray(empRes.data)) {
        setEmployees(empRes.data);
      }
      if (deptRes.success && Array.isArray(deptRes.data)) {
        setDepartments(deptRes.data);
      }
      if (desigRes.success && Array.isArray(desigRes.data)) {
        setDesignations(desigRes.data);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load employee records", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const name = emp.userId?.name?.toLowerCase() || "";
      const email = emp.userId?.email?.toLowerCase() || "";
      const empId = emp.employeeId?.toLowerCase() || "";
      const query = search.toLowerCase();

      const matchesSearch = !search || name.includes(query) || email.includes(query) || empId.includes(query);
      const matchesDept = selectedDept === "ALL" || emp.departmentId?._id === selectedDept;
      const matchesRole = selectedRole === "ALL" || emp.role === selectedRole;
      const matchesStatus = selectedStatus === "ALL" || emp.status === selectedStatus;

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
    });
  }, [employees, search, selectedDept, selectedRole, selectedStatus]);

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === "ACTIVE").length;
    const onLeave = employees.filter((e) => e.status === "ON_LEAVE").length;
    const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 35000), 0);
    return { total, active, onLeave, totalPayroll };
  }, [employees]);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      gender: "FEMALE",
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      departmentId: departments[0]?._id || "",
      designationId: designations[0]?._id || "",
      role: "NURSE",
      qualification: "B.Sc Nursing",
      shift: "MORNING",
      phone: "+91 ",
      emergencyContact: "+91 ",
      status: "ACTIVE",
      salary: "45000",
      bankName: "State Bank of India",
      accountNumber: "30012345678",
      ifscCode: "SBIN0001234",
      panNumber: "ABCDE1234F",
      aadhaarNumber: "1234 5678 9012",
      address: "Kolkata, West Bengal"
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (emp: EmployeeItem) => {
    setSelectedEmp(emp);
    setFormData({
      name: emp.userId?.name || "",
      email: emp.userId?.email || "",
      gender: emp.userId?.gender || "OTHER",
      employeeId: emp.employeeId || "",
      departmentId: emp.departmentId?._id || "",
      designationId: emp.designationId?._id || "",
      role: emp.role || "NURSE",
      qualification: emp.qualification || "",
      shift: emp.shift || "MORNING",
      phone: emp.phone || emp.userId?.phone || "",
      emergencyContact: emp.emergencyContact || "",
      status: emp.status || "ACTIVE",
      salary: String(emp.salary || 35000),
      bankName: emp.bankName || "",
      accountNumber: emp.accountNumber || "",
      ifscCode: emp.ifscCode || "",
      panNumber: emp.panNumber || "",
      aadhaarNumber: emp.aadhaarNumber || "",
      address: emp.address || ""
    });
    setIsEditOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hr/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Employee registered successfully!" });
        setIsAddOpen(false);
        fetchData();
      } else {
        toast({ title: "Error", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add employee", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/hr/employees/${selectedEmp._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Employee record updated successfully!" });
        setIsEditOpen(false);
        fetchData();
      } else {
        toast({ title: "Error", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update employee", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmp) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/hr/employees/${selectedEmp._id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Employee deleted successfully!" });
        setIsDeleteOpen(false);
        fetchData();
      } else {
        toast({ title: "Error", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete employee", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Employee ID", "Name", "Email", "Role", "Department", "Designation", "Shift", "Monthly Salary (INR)", "Status", "Joining Date"];
    const rows = filteredEmployees.map((e) => [
      `"${e.employeeId}"`,
      `"${e.userId?.name || "N/A"}"`,
      `"${e.userId?.email || "N/A"}"`,
      `"${e.role}"`,
      `"${e.departmentId?.name || "N/A"}"`,
      `"${e.designationId?.name || "N/A"}"`,
      `"${e.shift}"`,
      `"${Number(e.salary || 35000)}"`,
      `"${e.status}"`,
      `"${e.joiningDate ? new Date(e.joiningDate).toLocaleDateString("en-IN") : "N/A"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hospital_employees_${new Date().toISOString().split("T")[0]}.csv`);
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
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Employee Management Directory
              </h1>
              <p className="text-sm text-muted-foreground">
                Hospital-wide personnel directory covering medical staff, administrative workforce, compensation in ₹, and duty statuses.
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
          <Button size="sm" onClick={handleOpenAdd} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <UserPlus className="h-4 w-4" />
            Onboard Employee
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Employees
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats.total}
            </div>
            <div className="text-xs text-muted-foreground mt-1">All hospital units</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active On-Duty
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {loading ? "..." : stats.active}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Ready for patient care</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              On Leave Today
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {loading ? "..." : stats.onLeave}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Approved leave requests</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Payroll Commitment
            </CardTitle>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">
              {loading ? "..." : `₹${stats.totalPayroll.toLocaleString("en-IN")}`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Monthly base salary liability</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, EMP-ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Employee Roster</CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredEmployees.length} of {employees.length} employees
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="w-[120px]">Employee ID</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Role & Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Monthly Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        Loading employees...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      No employees found matching the filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp) => (
                    <TableRow key={emp._id} className="hover:bg-muted/30 text-xs">
                      <TableCell className="font-mono font-semibold text-foreground">
                        {emp.employeeId}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{emp.userId?.name || "Employee"}</div>
                        <div className="text-[11px] text-muted-foreground">{emp.userId?.email || "No Email"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{emp.designationId?.name || emp.role}</div>
                        <div className="text-[11px] text-muted-foreground">{emp.qualification || "Credentials on file"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {emp.departmentId?.name || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{emp.shift}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-medium text-foreground">
                        ₹{(Number(emp.salary) || 35000).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            emp.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : emp.status === "ON_LEAVE"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setSelectedEmp(emp);
                              setIsViewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700"
                            onClick={() => handleOpenEdit(emp)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600"
                            onClick={() => {
                              setSelectedEmp(emp);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ADD EMPLOYEE DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Onboard New Employee</DialogTitle>
            <DialogDescription>Register a new hospital employee with credentials, compensation in ₹, and role assignment.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Sister Priya Das"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email Address *</Label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. priya.das@medistra.hospital"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Employee ID *</Label>
                <Input
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="text-xs uppercase"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Role *</Label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Department *</Label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Designation *</Label>
                <select
                  value={formData.designationId}
                  onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground"
                >
                  {designations.map((des) => (
                    <option key={des._id} value={des._id}>{des.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Qualification</Label>
                <Input
                  placeholder="e.g. B.Sc Nursing / D.Pharm"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Shift *</Label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground"
                >
                  {SHIFTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Monthly Base Salary (₹) *</Label>
                <Input
                  required
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Contact Phone</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bank Name</Label>
                <Input
                  placeholder="e.g. State Bank of India"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bank Account Number</Label>
                <Input
                  placeholder="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">IFSC Code</Label>
                <Input
                  placeholder="e.g. SBIN0001234"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="text-xs uppercase"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">PAN Number</Label>
                <Input
                  placeholder="e.g. ABCDE1234F"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  className="text-xs uppercase"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {submitting ? "Onboarding..." : "Register Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT EMPLOYEE DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee Profile</DialogTitle>
            <DialogDescription>Modify department, designation, monthly compensation in ₹, or duty status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Designation</Label>
                <select
                  value={formData.designationId}
                  onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground"
                >
                  {designations.map((des) => (
                    <option key={des._id} value={des._id}>{des.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Monthly Salary (₹)</Label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Shift</Label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground"
                >
                  {SHIFTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Emergency Contact</Label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW EMPLOYEE DETAILS */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Employee Dossier</DialogTitle>
            <DialogDescription>Full hospital record for {selectedEmp?.userId?.name}</DialogDescription>
          </DialogHeader>
          {selectedEmp && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {selectedEmp.userId?.name?.charAt(0) || "E"}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{selectedEmp.userId?.name}</div>
                  <div className="text-muted-foreground font-mono">{selectedEmp.employeeId} • {selectedEmp.role}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-background rounded border border-border">
                  <div className="text-muted-foreground text-[11px]">Department</div>
                  <div className="font-medium mt-0.5">{selectedEmp.departmentId?.name || "General"}</div>
                </div>
                <div className="p-2.5 bg-background rounded border border-border">
                  <div className="text-muted-foreground text-[11px]">Designation</div>
                  <div className="font-medium mt-0.5">{selectedEmp.designationId?.name || "Staff"}</div>
                </div>
                <div className="p-2.5 bg-background rounded border border-border">
                  <div className="text-muted-foreground text-[11px]">Monthly Base Pay</div>
                  <div className="font-semibold font-mono text-emerald-600 mt-0.5">
                    ₹{(Number(selectedEmp.salary) || 35000).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-2.5 bg-background rounded border border-border">
                  <div className="text-muted-foreground text-[11px]">Assigned Shift</div>
                  <div className="font-medium mt-0.5">{selectedEmp.shift}</div>
                </div>
                <div className="p-2.5 bg-background rounded border border-border">
                  <div className="text-muted-foreground text-[11px]">PAN Number</div>
                  <div className="font-mono mt-0.5">{selectedEmp.panNumber || "ABCDE1234F"}</div>
                </div>
                <div className="p-2.5 bg-background rounded border border-border">
                  <div className="text-muted-foreground text-[11px]">Aadhaar Number</div>
                  <div className="font-mono mt-0.5">{selectedEmp.aadhaarNumber || "XXXX-XXXX-9012"}</div>
                </div>
              </div>

              <div className="p-2.5 bg-background rounded border border-border space-y-1">
                <div className="text-muted-foreground text-[11px]">Bank Direct Deposit</div>
                <div className="font-medium text-foreground">
                  {selectedEmp.bankName || "State Bank of India"} • A/C: {selectedEmp.accountNumber || "30012345678"} • IFSC: {selectedEmp.ifscCode || "SBIN0001234"}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Employee Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete employee record for <span className="font-semibold">{selectedEmp?.userId?.name}</span> ({selectedEmp?.employeeId})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
