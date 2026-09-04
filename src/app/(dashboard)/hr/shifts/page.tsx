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
  Clock,
  Plus,
  Search,
  Calendar,
  Building2,
  Users,
  Download,
  RefreshCw,
  Loader2,
  Trash2,
  Pencil,
  Sun,
  Sunset,
  Moon
} from "lucide-react";

interface ShiftItem {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  ward?: {
    _id: string;
    wardName: string;
    wardType: string;
    floor: number;
  };
  startTime: string;
  endTime: string;
  shiftType: "MORNING" | "EVENING" | "NIGHT";
  status: "SCHEDULED" | "ONGOING" | "COMPLETED";
  notes?: string;
}

export default function HRShiftsPage() {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedShiftType, setSelectedShiftType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const { toast } = useToast();

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    userId: "",
    wardId: "",
    shiftType: "MORNING",
    status: "SCHEDULED",
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16),
    notes: "Regular ward rotation"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shiftRes, empRes, wardRes] = await Promise.all([
        fetch("/api/hr/shifts").then((r) => r.json()).catch(() => ({})),
        fetch("/api/hr/employees").then((r) => r.json()).catch(() => ({})),
        fetch("/api/ward").then((r) => r.json()).catch(() => ({}))
      ]);

      if (shiftRes.success && Array.isArray(shiftRes.data)) {
        setShifts(shiftRes.data);
      }
      if (empRes.success && Array.isArray(empRes.data)) {
        setEmployees(empRes.data);
        if (empRes.data[0]?.userId?._id && !formData.userId) {
          setFormData((prev) => ({ ...prev, userId: empRes.data[0].userId._id }));
        }
      }
      if (wardRes.success && Array.isArray(wardRes.data)) {
        setWards(wardRes.data);
        if (wardRes.data[0]?._id && !formData.wardId) {
          setFormData((prev) => ({ ...prev, wardId: wardRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.error("Failed to load shift rosters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return shifts.filter((s) => {
      const userName = s.user?.name?.toLowerCase() || "";
      const wardName = s.ward?.wardName?.toLowerCase() || "";
      const q = search.toLowerCase();

      const matchesSearch = !search || userName.includes(q) || wardName.includes(q);
      const matchesType = selectedShiftType === "ALL" || s.shiftType === selectedShiftType;
      const matchesStatus = selectedStatus === "ALL" || s.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [shifts, search, selectedShiftType, selectedStatus]);

  const stats = useMemo(() => {
    const morning = shifts.filter((s) => s.shiftType === "MORNING").length;
    const evening = shifts.filter((s) => s.shiftType === "EVENING").length;
    const night = shifts.filter((s) => s.shiftType === "NIGHT").length;
    const ongoing = shifts.filter((s) => s.status === "ONGOING").length;
    return { morning, evening, night, ongoing };
  }, [shifts]);

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hr/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Shift assigned successfully!" });
        setIsAddOpen(false);
        fetchData();
      } else {
        toast({ title: "Error", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to assign shift", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/hr/shifts/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Shift removed from roster" });
        fetchData();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to remove shift", variant: "destructive" });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Employee Name", "Role", "Ward Location", "Shift Type", "Start Time", "End Time", "Duty Status", "Notes"];
    const rows = filtered.map((s) => [
      `"${s.user?.name || "N/A"}"`,
      `"${s.user?.role || "Staff"}"`,
      `"${s.ward?.wardName || "General Unit"}"`,
      `"${s.shiftType}"`,
      `"${s.startTime ? new Date(s.startTime).toLocaleString("en-IN") : "N/A"}"`,
      `"${s.endTime ? new Date(s.endTime).toLocaleString("en-IN") : "N/A"}"`,
      `"${s.status}"`,
      `"${s.notes || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hospital_shift_rosters_${new Date().toISOString().split("T")[0]}.csv`);
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
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Clock className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Shift Rostering & Duty Rotations
              </h1>
              <p className="text-sm text-muted-foreground">
                Clinical shift planning across Morning (07:00-15:00), Evening (15:00-23:00), and Night (23:00-07:00) cycles.
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
            Export Roster
          </Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            Assign Duty Shift
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Morning Shift (07:00 - 15:00)
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Sun className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : stats.morning}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Staff rostered for day rounds</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Evening Shift (15:00 - 23:00)
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
              <Sunset className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loading ? "..." : stats.evening}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Evening inpatient care & intake</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Night Shift (23:00 - 07:00)
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
              <Moon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {loading ? "..." : stats.night}
            </div>
            <div className="text-xs text-muted-foreground mt-1">ICU, Emergency & Night duty</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Currently On-Duty
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {loading ? "..." : stats.ongoing}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Active floor presence</div>
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
                placeholder="Search staff name, ward location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedShiftType}
                onChange={(e) => setSelectedShiftType(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Shift Cycles</option>
                <option value="MORNING">Morning (07:00 - 15:00)</option>
                <option value="EVENING">Evening (15:00 - 23:00)</option>
                <option value="NIGHT">Night (23:00 - 07:00)</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift Rosters Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Active Roster & Floor Allocation</CardTitle>
          <CardDescription className="text-xs">
            Showing {filtered.length} duty allocations across clinical wards and emergency units
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead>Assigned Personnel</TableHead>
                  <TableHead>Ward / Unit</TableHead>
                  <TableHead>Shift Cycle</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duty Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                        Loading duty rosters...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      No shift rosters found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s._id} className="hover:bg-muted/30 text-xs">
                      <TableCell>
                        <div className="font-semibold text-foreground">{s.user?.name || "Staff Member"}</div>
                        <div className="text-[11px] text-muted-foreground">{s.user?.role || "Healthcare"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {s.ward?.wardName || "General Ward"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-medium">
                          {s.shiftType === "MORNING" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
                          {s.shiftType === "EVENING" && <Sunset className="h-3.5 w-3.5 text-orange-500" />}
                          {s.shiftType === "NIGHT" && <Moon className="h-3.5 w-3.5 text-indigo-500" />}
                          <span>{s.shiftType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-mono">
                        {s.startTime ? new Date(s.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                      </TableCell>
                      <TableCell className="text-foreground font-mono">
                        {s.endTime ? new Date(s.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            s.status === "ONGOING"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : s.status === "COMPLETED"
                              ? "bg-muted text-muted-foreground"
                              : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          }`}
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {s.notes || "Standard Duty"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-600"
                          onClick={() => handleDelete(s._id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* ASSIGN SHIFT DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Duty Shift</DialogTitle>
            <DialogDescription>Schedule a healthcare professional to a clinical ward or emergency wing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAdd} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label>Select Healthcare Staff *</Label>
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
              <Label>Assigned Ward / Floor *</Label>
              <select
                value={formData.wardId}
                onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs"
              >
                {wards.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.wardName} (Floor {w.floor})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Shift Cycle *</Label>
                <select
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as any })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs"
                >
                  <option value="MORNING">Morning (07:00 - 15:00)</option>
                  <option value="EVENING">Evening (15:00 - 23:00)</option>
                  <option value="NIGHT">Night (23:00 - 07:00)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Shift Start Time *</Label>
                <Input
                  required
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Shift End Time *</Label>
                <Input
                  required
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Duty Notes / Assignment</Label>
              <Input
                placeholder="e.g. ICU ventilator bedside care"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {submitting ? "Assigning..." : "Assign Duty"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
