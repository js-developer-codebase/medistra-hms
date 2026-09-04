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
  FileCheck2,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Loader2,
  Users,
  AlertCircle
} from "lucide-react";

interface LeaveItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  leaveType: "CASUAL" | "SICK" | "EARNED" | "MATERNITY" | "PATERNITY" | "UNPAID";
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  appliedAt: string;
  approvedBy?: {
    _id: string;
    name: string;
  };
  actionDate?: string;
  rejectionReason?: string;
}

const LEAVE_TYPES = ["CASUAL", "SICK", "EARNED", "MATERNITY", "PATERNITY", "UNPAID"];

export default function HRLeavePage() {
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const { toast } = useToast();

  // Modals
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    userId: "",
    leaveType: "CASUAL",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    daysCount: 3,
    reason: "Family emergency"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaveRes, empRes] = await Promise.all([
        fetch("/api/hr/leave").then((r) => r.json()).catch(() => ({})),
        fetch("/api/hr/employees").then((r) => r.json()).catch(() => ({}))
      ]);

      if (leaveRes.success && Array.isArray(leaveRes.data)) {
        setLeaves(leaveRes.data);
      }
      if (empRes.success && Array.isArray(empRes.data)) {
        setEmployees(empRes.data);
        if (empRes.data[0]?.userId?._id && !formData.userId) {
          setFormData((prev) => ({ ...prev, userId: empRes.data[0].userId._id }));
        }
      }
    } catch (err) {
      console.error("Failed to load leave records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return leaves.filter((l) => {
      const name = l.userId?.name?.toLowerCase() || "";
      const reason = l.reason?.toLowerCase() || "";
      const q = search.toLowerCase();

      const matchesSearch = !search || name.includes(q) || reason.includes(q);
      const matchesStatus = selectedStatus === "ALL" || l.status === selectedStatus;
      const matchesType = selectedType === "ALL" || l.leaveType === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaves, search, selectedStatus, selectedType]);

  const stats = useMemo(() => {
    const pending = leaves.filter((l) => l.status === "PENDING").length;
    const approved = leaves.filter((l) => l.status === "APPROVED").length;
    const sickLeaves = leaves.filter((l) => l.leaveType === "SICK").length;
    const casualLeaves = leaves.filter((l) => l.leaveType === "CASUAL").length;
    return { pending, approved, sickLeaves, casualLeaves };
  }, [leaves]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hr/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Leave request submitted successfully!" });
        setIsApplyOpen(false);
        fetchData();
      } else {
        toast({ title: "Error", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit leave", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/hr/leave/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Approved", description: "Leave request has been approved." });
        fetchData();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to approve leave", variant: "destructive" });
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedLeave) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/hr/leave/${selectedLeave._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", rejectionReason })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Rejected", description: "Leave request was declined with remarks." });
        setIsRejectOpen(false);
        fetchData();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to reject leave", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Staff Member", "Role", "Leave Type", "Start Date", "End Date", "Days Count", "Reason", "Status", "Applied At"];
    const rows = filtered.map((l) => [
      `"${l.userId?.name || "N/A"}"`,
      `"${l.userId?.role || "Staff"}"`,
      `"${l.leaveType}"`,
      `"${new Date(l.startDate).toLocaleDateString("en-IN")}"`,
      `"${new Date(l.endDate).toLocaleDateString("en-IN")}"`,
      `"${l.daysCount}"`,
      `"${l.reason}"`,
      `"${l.status}"`,
      `"${new Date(l.appliedAt).toLocaleDateString("en-IN")}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leave_management_register_${new Date().toISOString().split("T")[0]}.csv`);
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
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <FileCheck2 className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Leave Management & Approval Desk
              </h1>
              <p className="text-sm text-muted-foreground">
                Process employee leave applications, review clinical staffing cover, and approve or decline with justification remarks.
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
          <Button size="sm" onClick={() => setIsApplyOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            Apply For Leave
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Action Requests
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {loading ? "..." : stats.pending}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Awaiting managerial sign-off</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Approved Applications
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {loading ? "..." : stats.approved}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Authorized absence records</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Casual Leaves (CL)
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats.casualLeaves}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Personal and routine leaves</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Medical & Sick Leaves (SL)
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {loading ? "..." : stats.sickLeaves}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Health & recuperation leaves</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff name, reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Leave Categories</option>
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaves Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Staff Leave Ledger</CardTitle>
          <CardDescription className="text-xs">
            Showing {filtered.length} leave requests and approvals
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Leave Category</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead className="text-center">Days</TableHead>
                  <TableHead>Stated Reason</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                        Loading leave records...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      No leave records found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((l) => (
                    <TableRow key={l._id} className="hover:bg-muted/30 text-xs">
                      <TableCell>
                        <div className="font-semibold text-foreground">{l.userId?.name || "Staff Member"}</div>
                        <div className="text-[11px] text-muted-foreground">{l.userId?.role}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            l.leaveType === "SICK"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : l.leaveType === "CASUAL"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {l.leaveType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-foreground">
                        {new Date(l.startDate).toLocaleDateString("en-IN")} → {new Date(l.endDate).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-center font-bold text-foreground">
                        {l.daysCount}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[220px] truncate">
                        {l.reason}
                        {l.rejectionReason && (
                          <div className="text-[10px] text-rose-500 font-medium mt-0.5">Remarks: {l.rejectionReason}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(l.appliedAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            l.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : l.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          }`}
                        >
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {l.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px] text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                              onClick={() => handleApprove(l._id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px] text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                              onClick={() => {
                                setSelectedLeave(l);
                                setRejectionReason("");
                                setIsRejectOpen(true);
                              }}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* APPLY FOR LEAVE DIALOG */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Leave Request</DialogTitle>
            <DialogDescription>Submit planned or medical leave on behalf of a healthcare worker.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label>Select Staff Member *</Label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs"
              >
                {employees.map((e) => (
                  <option key={e.userId?._id} value={e.userId?._id}>
                    {e.userId?.name} ({e.role} - {e.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Leave Category *</Label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs"
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start Date *</Label>
                <Input
                  required
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>End Date *</Label>
                <Input
                  required
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Reason / Clinical Justification *</Label>
              <Input
                required
                placeholder="e.g. Severe viral infection with medical certificate"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DECLINE LEAVE DIALOG */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Leave Request</DialogTitle>
            <DialogDescription>
              Provide an administrative or operational reason for declining this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label>Rejection Remarks *</Label>
              <Input
                placeholder="e.g. Insufficient clinical ward cover during festival peak"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsRejectOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRejectConfirm} disabled={submitting}>
                {submitting ? "Declining..." : "Confirm Decline"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
