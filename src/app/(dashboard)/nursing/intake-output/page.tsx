"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Droplets,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Calendar,
  User,
  Loader2,
  CheckCircle2,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default function IntakeOutputPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <IntakeOutputContent />
    </Suspense>
  );
}

function IntakeOutputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [inpatients, setInpatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientFilter, setSelectedPatientFilter] = useState(initialPatientId || "ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: initialPatientId,
    timeSlot: "08:00 AM",
    intakeType: "ORAL",
    intakeAmountMl: "250",
    intakeDetails: "",
    outputType: "URINE",
    outputAmountMl: "300",
    outputDetails: "",
    notes: ""
  });

  const loadData = async () => {
    try {
      const [ioRes, ptsRes] = await Promise.all([
        fetch("/api/nursing/intake-output"),
        fetch("/api/nursing/my-patients")
      ]);

      const [ioData, ptsData] = await Promise.all([
        ioRes.json(),
        ptsRes.json()
      ]);

      if (ioData.success) setRecords(ioData.data || []);
      if (ptsData.success) {
        setInpatients(ptsData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
    } catch (err) {
      toast("Failed to load fluid intake and output records", "error");
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
    if (!formData.patient) {
      toast("Please select an admitted patient", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: formData.patient,
        timeSlot: formData.timeSlot,
        intakeType: formData.intakeType,
        intakeAmountMl: parseFloat(formData.intakeAmountMl) || 0,
        intakeDetails: formData.intakeDetails,
        outputType: formData.outputType,
        outputAmountMl: parseFloat(formData.outputAmountMl) || 0,
        outputDetails: formData.outputDetails,
        notes: formData.notes,
        recordDate: new Date().toISOString()
      };

      const res = await fetch("/api/nursing/intake-output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Fluid balance entry logged successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: selectedPatientFilter !== "ALL" ? selectedPatientFilter : "",
          timeSlot: "08:00 AM",
          intakeType: "ORAL",
          intakeAmountMl: "250",
          intakeDetails: "",
          outputType: "URINE",
          outputAmountMl: "300",
          outputDetails: "",
          notes: ""
        });
        loadData();
      } else {
        toast(data.message || "Failed to log fluid balance", "error");
      }
    } catch (err) {
      toast("An error occurred while logging fluid entry", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fluid entry?")) return;
    try {
      const res = await fetch(`/api/nursing/intake-output/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Fluid entry removed", "success");
        loadData();
      } else {
        toast(data.message || "Failed to delete entry", "error");
      }
    } catch (err) {
      toast("Error deleting fluid entry", "error");
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (r.patient?.name || "").toLowerCase();
      const uhid = (r.patient?.uhid || "").toLowerCase();

      const matchesSearch = !q || patName.includes(q) || uhid.includes(q);

      let matchesPatient = true;
      if (selectedPatientFilter !== "ALL") {
        const pId = r.patient?._id || r.patient;
        matchesPatient = pId === selectedPatientFilter;
      }

      return matchesSearch && matchesPatient;
    });
  }, [records, searchQuery, selectedPatientFilter]);

  const summary = useMemo(() => {
    let totalIntake = 0;
    let totalOutput = 0;
    filteredRecords.forEach((r) => {
      totalIntake += r.intakeAmountMl || 0;
      totalOutput += r.outputAmountMl || 0;
    });
    const netBalance = totalIntake - totalOutput;
    return { totalIntake, totalOutput, netBalance };
  }, [filteredRecords]);

  const exportCSV = () => {
    if (filteredRecords.length === 0) {
      toast("No fluid balance records to export", "error");
      return;
    }

    const headers = [
      "Record Date",
      "Time Slot",
      "Patient Name",
      "UHID",
      "Intake Type",
      "Intake (ml)",
      "Intake Details",
      "Output Type",
      "Output (ml)",
      "Output Details",
      "Net (ml)"
    ];

    const rows = filteredRecords.map((r) => [
      `"${new Date(r.recordDate || r.createdAt).toLocaleDateString()}"`,
      `"${r.timeSlot || ""}"`,
      `"${r.patient?.name || ""}"`,
      `"${r.patient?.uhid || ""}"`,
      r.intakeType || "NONE",
      r.intakeAmountMl || 0,
      `"${(r.intakeDetails || "").replace(/"/g, '""')}"`,
      r.outputType || "NONE",
      r.outputAmountMl || 0,
      `"${(r.outputDetails || "").replace(/"/g, '""')}"`,
      (r.intakeAmountMl || 0) - (r.outputAmountMl || 0)
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fluid_Intake_Output_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Fluid balance records exported successfully", "success");
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
            <Droplets className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            Fluid Intake & Output (I/O) Charting
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor 24-hour hydration balance, intravenous fluids, enteral feeding, urinary output, and surgical drains.
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
            className="bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Log Fluid Entry
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Fluid Intake</div>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
              {summary.totalIntake} ml
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Oral + IV + Blood</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
            <Droplets className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Fluid Output</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {summary.totalOutput} ml
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Urine + Drains + Loss</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Net Fluid Balance</div>
            <div
              className={`text-2xl font-bold mt-1 ${
                summary.netBalance >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {summary.netBalance >= 0 ? `+${summary.netBalance}` : summary.netBalance} ml
            </div>
            <div className="text-[10px] font-medium mt-0.5 text-slate-500">
              {summary.netBalance >= 0 ? "Positive Fluid Balance" : "Negative Fluid Balance"}
            </div>
          </div>
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              summary.netBalance >= 0
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-600"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient name, UHID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-60">
              <Select
                value={selectedPatientFilter}
                onChange={(e) => setSelectedPatientFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Inpatients</option>
                {inpatients.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    Bed {p.bedNumber} - {p.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* I/O Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Fluid Balance Roster</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {records.length} charted fluid transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Inpatient Particulars</TableHead>
                  <TableHead>Intake Route & Details</TableHead>
                  <TableHead className="text-right">Intake (ml)</TableHead>
                  <TableHead>Output Source & Details</TableHead>
                  <TableHead className="text-right">Output (ml)</TableHead>
                  <TableHead className="text-right">Net Shift (ml)</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-12 text-xs">
                      No fluid intake/output records found. Click "Log Fluid Entry" to record balance.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((r) => {
                    const net = (r.intakeAmountMl || 0) - (r.outputAmountMl || 0);
                    return (
                      <TableRow key={r._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                          {r.timeSlot || "Scheduled"}
                          <div className="text-[10px] text-slate-400">
                            {new Date(r.recordDate || r.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {r.patient?.name || "Unknown"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {r.patient?.uhid}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px] mr-1.5">
                            {r.intakeType || "NONE"}
                          </Badge>
                          <span className="text-slate-600 dark:text-slate-400">
                            {r.intakeDetails || "Oral fluid / IV"}
                          </span>
                        </TableCell>

                        <TableCell className="text-right font-mono font-bold text-sky-600">
                          {r.intakeAmountMl || 0} ml
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px] mr-1.5">
                            {r.outputType || "NONE"}
                          </Badge>
                          <span className="text-slate-600 dark:text-slate-400">
                            {r.outputDetails || "Urinary"}
                          </span>
                        </TableCell>

                        <TableCell className="text-right font-mono font-bold text-amber-600">
                          {r.outputAmountMl || 0} ml
                        </TableCell>

                        <TableCell
                          className={`text-right font-mono font-bold ${
                            net >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {net >= 0 ? `+${net}` : net} ml
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-rose-600 hover:text-rose-700 ml-auto"
                            onClick={() => handleDelete(r._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      {/* Log Fluid Entry Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Droplets className="h-5 w-5 text-sky-600" />
                Log Fluid Intake & Output
              </DialogTitle>
              <DialogDescription>
                Record shift fluid amounts for hydration and renal function monitoring.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="patient" className="text-xs font-semibold">
                    Inpatient *
                  </Label>
                  <Select
                    id="patient"
                    value={formData.patient}
                    onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                    required
                    className="h-9 text-xs"
                  >
                    <option value="">-- Choose Inpatient --</option>
                    {inpatients.map((p) => (
                      <option key={p.patientId} value={p.patientId}>
                        Bed {p.bedNumber} - {p.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="slot" className="text-xs font-semibold">
                    Time Slot *
                  </Label>
                  <Select
                    id="slot"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="08:00 PM">08:00 PM</option>
                    <option value="12:00 AM">12:00 AM (Midnight)</option>
                    <option value="04:00 AM">04:00 AM</option>
                  </Select>
                </div>
              </div>

              {/* Intake Section */}
              <div className="p-3 bg-sky-50/50 dark:bg-sky-950/20 rounded-lg border border-sky-200 dark:border-sky-900 space-y-2">
                <span className="font-bold text-sky-700 dark:text-sky-300 block text-[11px] uppercase">
                  Fluid Intake
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-slate-500">Type</Label>
                    <Select
                      value={formData.intakeType}
                      onChange={(e) => setFormData({ ...formData, intakeType: e.target.value })}
                      className="h-8 text-xs"
                    >
                      <option value="ORAL">Oral Fluid (Water/Soup)</option>
                      <option value="IV_FLUID">IV Fluid (Saline/DNS)</option>
                      <option value="BLOOD_PRODUCT">Blood Product</option>
                      <option value="TUBE_FEED">Enteral / NG Feed</option>
                      <option value="NONE">None</option>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-500">Amount (ml)</Label>
                    <Input
                      type="number"
                      value={formData.intakeAmountMl}
                      onChange={(e) => setFormData({ ...formData, intakeAmountMl: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
                <Input
                  placeholder="Intake details e.g. 500ml Normal Saline at 80ml/hr"
                  value={formData.intakeDetails}
                  onChange={(e) => setFormData({ ...formData, intakeDetails: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              {/* Output Section */}
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900 space-y-2">
                <span className="font-bold text-amber-700 dark:text-amber-300 block text-[11px] uppercase">
                  Fluid Output
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-slate-500">Type</Label>
                    <Select
                      value={formData.outputType}
                      onChange={(e) => setFormData({ ...formData, outputType: e.target.value })}
                      className="h-8 text-xs"
                    >
                      <option value="URINE">Urine / Foley Bag</option>
                      <option value="DRAIN">Surgical Drain</option>
                      <option value="VOMITUS">Vomitus</option>
                      <option value="STOOL">Liquid Stool</option>
                      <option value="NG_ASPIRATE">NG Aspirate</option>
                      <option value="NONE">None</option>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-500">Amount (ml)</Label>
                    <Input
                      type="number"
                      value={formData.outputAmountMl}
                      onChange={(e) => setFormData({ ...formData, outputAmountMl: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
                <Input
                  placeholder="Output details e.g. Clear yellow urine, 20ml serous drain"
                  value={formData.outputDetails}
                  onChange={(e) => setFormData({ ...formData, outputDetails: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Fluid Balance
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
