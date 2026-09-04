"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Share2,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Loader2
} from "lucide-react";

export default function ClinicalReferralsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ClinicalReferralsContent />
    </Suspense>
  );
}

function ClinicalReferralsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [referrals, setReferrals] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: initialPatientId,
    doctor: "",
    referralTo: "Cardiology",
    title: "", // Reason
    priority: "Routine",
    details: "",
    status: "Final"
  });

  const loadData = async () => {
    try {
      const [recRes, patRes, docRes] = await Promise.all([
        fetch("/api/clinical/records?recordType=Referral"),
        fetch("/api/patient"),
        fetch("/api/user")
      ]);

      const [recData, patData, docData] = await Promise.all([
        recRes.json(),
        patRes.json(),
        docRes.json()
      ]);

      if (recData.success) setReferrals(recData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (initialPatientId) setCreateOpen(true);
      }
      if (docData.success) setDoctors(docData.data || []);
    } catch (err) {
      toast("Failed to load clinical referrals", "error");
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
    if (!formData.patient || !formData.title) {
      toast("Please select a patient and state the reason for referral", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        recordType: "Referral",
        dateRecorded: new Date().toISOString()
      };

      const res = await fetch("/api/clinical/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Specialist referral generated successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: "",
          doctor: "",
          referralTo: "Cardiology",
          title: "",
          priority: "Routine",
          details: "",
          status: "Final"
        });
        loadData();
      } else {
        toast(data.error || "Failed to generate referral", "error");
      }
    } catch (err) {
      toast("An error occurred while creating referral", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this referral?")) return;
    try {
      const res = await fetch(`/api/clinical/records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Referral cancelled", "success");
        loadData();
      } else {
        toast(data.error || "Failed to cancel referral", "error");
      }
    } catch (err) {
      toast("Error cancelling referral", "error");
    }
  };

  const filteredReferrals = useMemo(() => {
    return referrals.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (r.patient?.name || "").toLowerCase();
      const uhid = (r.patient?.uhid || "").toLowerCase();
      const spec = (r.referralTo || "").toLowerCase();
      const reason = (r.title || "").toLowerCase();
      const docName = (r.doctor?.name || "").toLowerCase();

      const matchesSearch =
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        spec.includes(q) ||
        reason.includes(q) ||
        docName.includes(q);

      let matchesSpec = true;
      if (specialtyFilter !== "ALL") {
        matchesSpec = r.referralTo === specialtyFilter;
      }

      return matchesSearch && matchesSpec;
    });
  }, [referrals, searchQuery, specialtyFilter]);

  const exportCSV = () => {
    if (filteredReferrals.length === 0) {
      toast("No referrals to export", "error");
      return;
    }

    const headers = [
      "Date Referred",
      "Patient Name",
      "UHID",
      "Target Specialty",
      "Clinical Reason",
      "Urgency",
      "Referring Physician"
    ];

    const rows = filteredReferrals.map((r) => [
      `"${new Date(r.dateRecorded || r.createdAt).toLocaleDateString()}"`,
      `"${r.patient?.name || ""}"`,
      `"${r.patient?.uhid || ""}"`,
      `"${r.referralTo || ""}"`,
      `"${(r.title || "").replace(/"/g, '""')}"`,
      r.priority || "Routine",
      `"Dr. ${r.doctor?.name || ""}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Clinical_Referrals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Referrals exported successfully", "success");
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
            <Share2 className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-400" />
            Specialist & Departmental Clinical Referrals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Facilitate cross-departmental specialist opinions, tertiary hospital transfers, and multidisciplinary consults.
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
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Initiate Referral
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search specialty, reason, patient name, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-60">
              <Select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="General Surgery">General Surgery</option>
                <option value="Nephrology">Nephrology</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Oncology">Oncology</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="External Tertiary Facility">External Tertiary Facility</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Referrals Ledger</CardTitle>
          <CardDescription>
            Showing {filteredReferrals.length} of {referrals.length} patient referrals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Referred</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Target Specialty / Department</TableHead>
                  <TableHead>Clinical Reason for Referral</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Referring Doctor</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No specialist referrals found. Click "Initiate Referral" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReferrals.map((r) => (
                    <TableRow key={r._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                        {new Date(r.dateRecorded || r.createdAt).toLocaleDateString()}
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
                        <Badge variant="outline" className="text-[10px] font-bold text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-300">
                          {r.referralTo || "Specialist"}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-medium text-slate-900 dark:text-white max-w-xs truncate">
                        {r.title}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            r.priority === "Urgent" || r.priority === "STAT"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                              : ""
                          }
                        >
                          {r.priority || "Routine"}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-medium">
                        Dr. {r.doctor?.name || "Referring Officer"}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Referral Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Share2 className="h-5 w-5 text-fuchsia-600" />
                Initiate Specialist Referral
              </DialogTitle>
              <DialogDescription>
                Request cross-consultation or specialist evaluation for patient care.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="patient" className="text-xs font-semibold">
                  Patient *
                </Label>
                <Select
                  id="patient"
                  value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                  required
                  className="h-9 text-xs"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.uhid || p.contact})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doctor" className="text-xs font-semibold">
                  Referring Physician
                </Label>
                <Select
                  id="doctor"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="h-9 text-xs"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="referralTo" className="text-xs font-semibold">
                    Target Specialty *
                  </Label>
                  <Select
                    id="referralTo"
                    value={formData.referralTo}
                    onChange={(e) => setFormData({ ...formData, referralTo: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Surgery">General Surgery</option>
                    <option value="Nephrology">Nephrology</option>
                    <option value="Pulmonology">Pulmonology</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="External Tertiary Facility">External Tertiary Facility</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-xs font-semibold">
                    Referral Urgency
                  </Label>
                  <Select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT">STAT / Emergency</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Clinical Reason for Referral *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Uncontrolled hypertension with target organ damage, Echocardiogram opinion"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="details" className="text-xs font-semibold">
                  Preliminary Findings & Clinical Summary
                </Label>
                <Textarea
                  id="details"
                  rows={3}
                  placeholder="Summarize recent investigations, ECG findings, medication trials, and specific questions for the specialist..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit Referral
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
