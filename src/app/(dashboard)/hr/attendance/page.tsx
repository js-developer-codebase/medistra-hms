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
  CalendarCheck,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  Loader2,
  Users,
  MapPin
} from "lucide-react";

interface AttendanceItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  date: string;
  clockIn: string;
  clockOut?: string;
  shiftType: string;
  status: "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT" | "ON_LEAVE";
  workingHours?: number;
  location?: string;
  notes?: string;
  verifiedBy?: string;
}

interface AttendanceStats {
  date: string;
  totalExpected: number;
  present: number;
  late: number;
  halfDay: number;
  onLeave: number;
  absent: number;
  attendanceRate: string;
}

export default function HRAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    date: new Date().toISOString().split("T")[0],
    totalExpected: 0,
    present: 0,
    late: 0,
    halfDay: 0,
    onLeave: 0,
    absent: 0,
    attendanceRate: "0%"
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  // Modals
  const [isPunchOpen, setIsPunchOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    userId: "",
    date: new Date().toISOString().split("T")[0],
    clockIn: new Date().toISOString().slice(0, 16),
    clockOut: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16),
    shiftType: "MORNING",
    status: "PRESENT",
    workingHours: "8",
    location: "Block A Biometric Terminal",
    notes: "Regular biometric sync"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, statRes, empRes] = await Promise.all([
        fetch(`/api/hr/attendance?date=${selectedDate}&status=${selectedStatus}`).then((r) => r.json()).catch(() => ({})),
        fetch(`/api/hr/attendance/stats?date=${selectedDate}`).then((r) => r.json()).catch(() => ({})),
        fetch("/api/hr/employees").then((r) => r.json()).catch(() => ({}))
      ]);

      if (attRes.success && Array.isArray(attRes.data)) {
        setAttendance(attRes.data);
      }
      if (statRes.success && statRes.data) {
        setStats(statRes.data);
      }
      if (empRes.success && Array.isArray(empRes.data)) {
        setEmployees(empRes.data);
        if (empRes.data[0]?.userId?._id && !formData.userId) {
          setFormData((prev) => ({ ...prev, userId: empRes.data[0].userId._id }));
        }
      }
    } catch (err) {
      console.error("Failed to load attendance records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedStatus]);

  const filtered = useMemo(() => {
    return attendance.filter((a) => {
      const userName = a.userId?.name?.toLowerCase() || "";
      const userRole = a.userId?.role?.toLowerCase() || "";
      const q = search.toLowerCase();
      return !search || userName.includes(q) || userRole.includes(q);
    });
  }, [attendance, search]);

  const handleSavePunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hr/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Attendance punch logged successfully!" });
        setIsPunchOpen(false);
        fetchData();
      } else {
        toast({ title: "Error", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to log punch", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Employee Name", "Role", "Date", "Clock In", "Clock Out", "Hours Worked", "Shift", "Status", "Terminal Location"];
    const rows = filtered.map((a) => [
      `"${a.userId?.name || "N/A"}"`,
      `"${a.userId?.role || "Staff"}"`,
      `"${new Date(a.date).toLocaleDateString("en-IN")}"`,
      `"${new Date(a.clockIn).toLocaleTimeString("en-IN")}"`,
      `"${a.clockOut ? new Date(a.clockOut).toLocaleTimeString("en-IN") : "N/A"}"`,
      `"${a.workingHours || 8} hrs"`,
      `"${a.shiftType}"`,
      `"${a.status}"`,
      `"${a.location || "Biometric Scanner"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_register_${selectedDate}.csv`);
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
            <span className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
              <CalendarCheck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Biometric Attendance & Daily Punch Register
              </h1>
              <p className="text-sm text-muted-foreground">
                Live terminal punch tracker, automatic shift hours calculation, late arrival audits, and manual attendance overrides.
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
            Export Register
          </Button>
          <Button size="sm" onClick={() => setIsPunchOpen(true)} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            Log Manual Punch
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Attendance Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {loading ? "..." : stats.attendanceRate}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stats.present + stats.late} of {stats.totalExpected} Expected</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Present On Time
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {loading ? "..." : stats.present}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Clocked in before shift</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Late Arrivals
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {loading ? "..." : stats.late}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Clocked in &gt; 15m past shift</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Approved Leave
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? "..." : stats.onLeave}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Authorized leave of absence</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unexcused Absences
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {loading ? "..." : stats.absent}
            </div>
            <div className="text-xs text-muted-foreground mt-1">No punch log recorded</div>
          </CardContent>
        </Card>
      </div>

      {/* Date & Filter Controls */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff name or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Date:</span>
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 w-40 text-xs"
              />

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="HALF_DAY">Half-Day</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Punch Logs Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Daily Punch Register</CardTitle>
          <CardDescription className="text-xs">
            Showing biometric timestamps and calculated duty duration for {new Date(selectedDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead>Biometric Terminal</TableHead>
                  <TableHead className="text-right">Punch Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                        Loading punch records...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      No attendance punch logs found for this date.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((att) => (
                    <TableRow key={att._id} className="hover:bg-muted/30 text-xs">
                      <TableCell>
                        <div className="font-semibold text-foreground">{att.userId?.name || "Employee"}</div>
                        <div className="text-[11px] text-muted-foreground">{att.userId?.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {att.userId?.role || "Staff"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {att.shiftType}
                      </TableCell>
                      <TableCell className="font-mono text-foreground font-semibold">
                        {att.clockIn ? new Date(att.clockIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-foreground">
                        {att.clockOut ? new Date(att.clockOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                      </TableCell>
                      <TableCell className="font-mono font-medium text-foreground">
                        {att.workingHours || 8} hrs
                      </TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-1.5 pt-3">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate max-w-[180px]">{att.location || "Biometric Terminal"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            att.status === "PRESENT"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : att.status === "LATE"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : att.status === "ON_LEAVE"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          }`}
                        >
                          {att.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* LOG MANUAL PUNCH DIALOG */}
      <Dialog open={isPunchOpen} onOpenChange={setIsPunchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Attendance Punch</DialogTitle>
            <DialogDescription>Add or override a biometric punch log for a staff member.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePunch} className="space-y-3 text-xs">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Shift Type</Label>
                <select
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs"
                >
                  <option value="MORNING">Morning</option>
                  <option value="EVENING">Evening</option>
                  <option value="NIGHT">Night</option>
                  <option value="GENERAL">General</option>
                  <option value="ROTATING">Rotating</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs"
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="HALF_DAY">Half-Day</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Clock In Time *</Label>
                <Input
                  required
                  type="datetime-local"
                  value={formData.clockIn}
                  onChange={(e) => setFormData({ ...formData, clockIn: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Clock Out Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.clockOut}
                  onChange={(e) => setFormData({ ...formData, clockOut: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Biometric Terminal Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Notes / Override Justification</Label>
              <Input
                placeholder="e.g. Biometric sensor finger scan retry"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsPunchOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white">
                {submitting ? "Logging..." : "Log Punch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
