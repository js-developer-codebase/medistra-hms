"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Calendar,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  User,
  Loader2,
  CheckCircle2,
  Play,
  Clock,
  Building2
} from "lucide-react";

export default function ShiftManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ShiftManagementContent />
    </Suspense>
  );
}

function ShiftManagementContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [shifts, setShifts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [shiftFilter, setShiftFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    user: "",
    ward: "",
    shiftType: "MORNING",
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 16),
    status: "SCHEDULED",
    notes: ""
  });

  const loadData = async () => {
    try {
      const [shiftsRes, wardsRes, usersRes] = await Promise.all([
        fetch("/api/nursing/shifts"),
        fetch("/api/ward"),
        fetch("/api/user")
      ]);

      const [shiftsData, wardsData, usersData] = await Promise.all([
        shiftsRes.json(),
        wardsRes.json(),
        usersRes.json()
      ]);

      if (shiftsData.success) setShifts(shiftsData.data || []);
      if (wardsData.success) setWards(wardsData.data || []);
      if (usersData.success) {
        setStaffList(usersData.data || []);
        if (usersData.data?.length > 0 && !formData.user) {
          setFormData((prev) => ({
            ...prev,
            user: usersData.data[0]._id,
            ward: wardsData.data?.[0]?._id || ""
          }));
        }
      }
    } catch (err) {
      toast("Failed to load duty roster and shifts", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user || !formData.ward) {
      toast("Please select a nurse and assign a ward", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user: formData.user,
        ward: formData.ward,
        shiftType: formData.shiftType,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        status: formData.status,
        notes: formData.notes
      };

      const res = await fetch("/api/nursing/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Duty shift scheduled successfully!", "success");
        setCreateOpen(false);
        setFormData({
          user: staffList[0]?._id || "",
          ward: wards[0]?._id || "",
          shiftType: "MORNING",
          startTime: new Date().toISOString().slice(0, 16),
          endTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 16),
          status: "SCHEDULED",
          notes: ""
        });
        loadData();
      } else {
        toast(data.message || "Failed to schedule shift", "error");
      }
    } catch (err) {
      toast("An error occurred while scheduling shift", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (shift: any, newStatus: string) => {
    try {
      const res = await fetch(`/api/nursing/shifts/${shift._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Shift status updated to ${newStatus}`, "success");
        loadData();
      } else {
        toast(data.message || "Failed to update shift", "error");
      }
    } catch (err) {
      toast("Error updating shift status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this duty shift?")) return;
    try {
      const res = await fetch(`/api/nursing/shifts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Shift schedule deleted", "success");
        loadData();
      } else {
        toast(data.message || "Failed to delete shift", "error");
      }
    } catch (err) {
      toast("Error deleting shift", "error");
    }
  };

  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const userName = (s.user?.name || "").toLowerCase();
      const wardName = (s.ward?.wardName || "").toLowerCase();

      const matchesSearch = !q || userName.includes(q) || wardName.includes(q);

      let matchesShift = true;
      if (shiftFilter !== "ALL") {
        matchesShift = s.shiftType === shiftFilter;
      }

      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = s.status === statusFilter;
      }

      return matchesSearch && matchesShift && matchesStatus;
    });
  }, [shifts, searchQuery, shiftFilter, statusFilter]);

  const statsCount = useMemo(() => {
    let scheduled = 0;
    let ongoing = 0;
    let completed = 0;
    shifts.forEach((s) => {
      if (s.status === "SCHEDULED") scheduled++;
      else if (s.status === "ONGOING") ongoing++;
      else if (s.status === "COMPLETED") completed++;
    });
    return { total: shifts.length, scheduled, ongoing, completed };
  }, [shifts]);

  const exportCSV = () => {
    if (filteredShifts.length === 0) {
      toast("No shifts to export", "error");
      return;
    }

    const headers = [
      "Staff Name",
      "Ward",
      "Shift Type",
      "Start Time",
      "End Time",
      "Status",
      "Notes"
    ];

    const rows = filteredShifts.map((s) => [
      `"${s.user?.name || ""}"`,
      `"${s.ward?.wardName || "Ward"}"`,
      s.shiftType || "MORNING",
      `"${new Date(s.startTime).toLocaleString()}"`,
      `"${new Date(s.endTime).toLocaleString()}"`,
      s.status || "SCHEDULED",
      `"${(s.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Duty_Roster_Shifts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Duty roster exported successfully", "success");
  };

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            Shift Management & Duty Roster
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nursing staff duty schedules, ward assignments, shift check-ins (Morning, Evening, Night), and roster coverage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Assign Shift
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Rostered</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {statsCount.total}
          </span>
          <span className="text-[10px] text-slate-400">All shifts</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Scheduled</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
            {statsCount.scheduled}
          </span>
          <span className="text-[10px] text-blue-600 font-medium">Upcoming shifts</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Ongoing (On Duty)</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {statsCount.ongoing}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">Actively on floor</span>
        </div>

        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-xs text-slate-500 block">Completed</span>
          <span className="text-xl font-bold text-slate-600 dark:text-slate-400 mt-1 block">
            {statsCount.completed}
          </span>
          <span className="text-[10px] text-slate-400">Past shifts</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search staff name, ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div>
              <Select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Shifts</option>
                <option value="MORNING">Morning Shift</option>
                <option value="EVENING">Evening Shift</option>
                <option value="NIGHT">Night Shift</option>
              </Select>
            </div>

            <div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ONGOING">Ongoing / On Duty</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shifts Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Duty Roster Ledger</CardTitle>
          <CardDescription>
            Showing {filteredShifts.length} of {shifts.length} rostered nurse shifts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Assigned Ward</TableHead>
                  <TableHead>Shift Type</TableHead>
                  <TableHead>Shift Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12 text-xs">
                      No duty shifts found. Click "Assign Shift" to roster nursing staff.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShifts.map((s) => {
                    const isOngoing = s.status === "ONGOING";
                    const isCompleted = s.status === "COMPLETED";
                    return (
                      <TableRow key={s._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {s.user?.name || "Staff Member"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {s.user?.email}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {s.ward?.wardName || "General Ward"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Floor {s.ward?.floor || 1}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {s.shiftType}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-mono text-slate-500">
                          {new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                          {new Date(s.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          <div className="text-[10px] text-slate-400">
                            {new Date(s.startTime).toLocaleDateString()}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isOngoing
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                                : isCompleted
                                ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300"
                            }
                          >
                            {s.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!isCompleted && (
                              <>
                                {!isOngoing && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 flex items-center gap-1"
                                    onClick={() => handleUpdateStatus(s, "ONGOING")}
                                  >
                                    <Play className="h-3 w-3" />
                                    Check-in
                                  </Button>
                                )}

                                {isOngoing && (
                                  <Button
                                    size="sm"
                                    className="h-7 px-2 text-xs bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1"
                                    onClick={() => handleUpdateStatus(s, "COMPLETED")}
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    End Shift
                                  </Button>
                                )}
                              </>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"
                              onClick={() => handleDelete(s._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Shift Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-700" />
                Assign Duty Shift
              </DialogTitle>
              <DialogDescription>
                Schedule nurse duty period and assign ward floor coverage.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="nurse" className="text-xs font-semibold">
                  Nursing Staff Member *
                </Label>
                <Select
                  id="nurse"
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  required
                  className="h-9 text-xs"
                >
                  <option value="">-- Choose Nurse / Staff --</option>
                  {staffList.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.role?.name || "Staff"})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ward" className="text-xs font-semibold">
                    Ward Location *
                  </Label>
                  <Select
                    id="ward"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    required
                    className="h-9 text-xs"
                  >
                    <option value="">-- Choose Ward --</option>
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.wardName}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-semibold">
                    Shift Type
                  </Label>
                  <Select
                    id="type"
                    value={formData.shiftType}
                    onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as any })}
                    className="h-9 text-xs"
                  >
                    <option value="MORNING">Morning (07:00 - 15:00)</option>
                    <option value="EVENING">Evening (15:00 - 23:00)</option>
                    <option value="NIGHT">Night (23:00 - 07:00)</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start" className="text-xs font-semibold">
                    Shift Start *
                  </Label>
                  <Input
                    type="datetime-local"
                    id="start"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="end" className="text-xs font-semibold">
                    Shift End *
                  </Label>
                  <Input
                    type="datetime-local"
                    id="end"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">
                  Duty Instructions / Handover Notes
                </Label>
                <Input
                  id="notes"
                  placeholder="e.g. Lead nurse for Post-Op Ward A, code team coverage..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Assign Shift
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
