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
  AlertOctagon,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  CheckCircle2
} from "lucide-react";

export default function AllergiesRegistryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <AllergiesRegistryContent />
    </Suspense>
  );
}

function AllergiesRegistryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") || "";
  const { toast } = useToast();

  const [allergies, setAllergies] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient: initialPatientId,
    title: "",
    category: "Drug Allergy",
    reaction: "",
    severity: "Severe",
    details: ""
  });

  const loadData = async () => {
    try {
      const [recRes, patRes] = await Promise.all([
        fetch("/api/clinical/records?recordType=Allergy"),
        fetch("/api/patient")
      ]);

      const [recData, patData] = await Promise.all([
        recRes.json(),
        patRes.json()
      ]);

      if (recData.success) setAllergies(recData.data || []);
      if (patData.success) setPatients(patData.data || []);
    } catch (err) {
      toast("Failed to load allergies data", "error");
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
      toast("Please select a patient and enter the allergen name", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient: formData.patient,
        recordType: "Allergy",
        title: formData.title,
        category: formData.category,
        reaction: formData.reaction,
        severity: formData.severity,
        details: formData.details,
        dateRecorded: new Date().toISOString()
      };

      const res = await fetch("/api/clinical/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Allergy safety flag recorded successfully!", "success");
        setCreateOpen(false);
        setFormData({
          patient: "",
          title: "",
          category: "Drug Allergy",
          reaction: "",
          severity: "Severe",
          details: ""
        });
        loadData();
      } else {
        toast(data.error || "Failed to record allergy", "error");
      }
    } catch (err) {
      toast("An error occurred while saving allergy record", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this allergy entry?")) return;
    try {
      const res = await fetch(`/api/clinical/records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Allergy entry removed", "success");
        loadData();
      } else {
        toast(data.error || "Failed to remove entry", "error");
      }
    } catch (err) {
      toast("Error removing record", "error");
    }
  };

  const filteredAllergies = useMemo(() => {
    return allergies.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const patName = (a.patient?.name || "").toLowerCase();
      const uhid = (a.patient?.uhid || "").toLowerCase();
      const allergen = (a.title || "").toLowerCase();
      const reaction = (a.reaction || "").toLowerCase();

      const matchesSearch =
        !q ||
        patName.includes(q) ||
        uhid.includes(q) ||
        allergen.includes(q) ||
        reaction.includes(q);

      let matchesCat = true;
      if (categoryFilter !== "ALL") {
        matchesCat = a.category === categoryFilter;
      }

      let matchesSev = true;
      if (severityFilter !== "ALL") {
        matchesSev = a.severity === severityFilter;
      }

      return matchesSearch && matchesCat && matchesSev;
    });
  }, [allergies, searchQuery, categoryFilter, severityFilter]);

  const statsCount = useMemo(() => {
    let drug = 0;
    let critical = 0;
    allergies.forEach((a) => {
      if (a.category === "Drug Allergy") drug++;
      if (a.severity === "Critical / Anaphylaxis" || a.severity === "Severe") critical++;
    });
    return { total: allergies.length, drug, critical };
  }, [allergies]);

  const exportCSV = () => {
    if (filteredAllergies.length === 0) {
      toast("No allergies to export", "error");
      return;
    }

    const headers = [
      "Date Recorded",
      "Patient Name",
      "UHID",
      "Allergen / Substance",
      "Category",
      "Adverse Reaction",
      "Severity Level",
      "Clinical Notes"
    ];

    const rows = filteredAllergies.map((a) => [
      `"${new Date(a.dateRecorded || a.createdAt).toLocaleDateString()}"`,
      `"${a.patient?.name || ""}"`,
      `"${a.patient?.uhid || ""}"`,
      `"${(a.title || "").replace(/"/g, '""')}"`,
      `"${a.category || "Drug Allergy"}"`,
      `"${(a.reaction || "").replace(/"/g, '""')}"`,
      `"${a.severity || "Severe"}"`,
      `"${(a.details || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Allergies_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Allergies registry exported", "success");
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
            <AlertOctagon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Allergy & Adverse Reaction Registry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Critical drug, food, and environmental allergy tracking to prevent contraindicated prescribing and treatment.
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
            className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Flag New Allergy
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Allergies Logged</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {statsCount.total}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Active safety flags</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Drug Allergies</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {statsCount.drug}
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5">Medication contraindications</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Severe / Anaphylaxis Risk</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {statsCount.critical}
            </div>
            <div className="text-[10px] text-rose-600 mt-0.5">High alert status</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search allergen, reaction, patient, UHID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Categories</option>
                <option value="Drug Allergy">Drug Allergy</option>
                <option value="Food Allergy">Food Allergy</option>
                <option value="Environmental">Environmental</option>
                <option value="Latex / Material">Latex / Material</option>
                <option value="Contrast Media">Contrast Media</option>
              </Select>
            </div>

            <div>
              <Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="h-9 text-xs w-full"
              >
                <option value="ALL">All Severities</option>
                <option value="Critical / Anaphylaxis">Critical / Anaphylaxis</option>
                <option value="Severe">Severe</option>
                <option value="Moderate">Moderate</option>
                <option value="Mild">Mild</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allergies Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Flagged Allergies Roster</CardTitle>
          <CardDescription>
            Showing {filteredAllergies.length} of {allergies.length} documented patient allergies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Logged</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Allergen / Substance</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Adverse Reaction</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllergies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No allergy records found matching filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAllergies.map((a) => (
                    <TableRow key={a._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                        {new Date(a.dateRecorded || a.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {a.patient?.name || "Unknown"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {a.patient?.uhid} • {a.patient?.gender}, {a.patient?.age}y
                        </div>
                      </TableCell>

                      <TableCell className="font-bold text-rose-700 dark:text-rose-400 text-sm">
                        {a.title}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {a.category || "Drug Allergy"}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                        {a.reaction || a.details || "Not specified"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            a.severity === "Critical / Anaphylaxis" || a.severity === "Severe"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                          }
                        >
                          {a.severity || "Severe"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-rose-600 hover:text-rose-700 ml-auto"
                          onClick={() => handleDelete(a._id)}
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

      {/* Create Allergy Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-rose-600" />
                Flag Patient Allergy
              </DialogTitle>
              <DialogDescription>
                Document medication, food, or environmental contraindications for clinical safety.
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
                <Label htmlFor="category" className="text-xs font-semibold">
                  Allergy Category
                </Label>
                <Select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-9 text-xs"
                >
                  <option value="Drug Allergy">Drug / Medication Allergy</option>
                  <option value="Food Allergy">Food / Dietary Allergy</option>
                  <option value="Environmental">Environmental (Pollen, Dust, Mold)</option>
                  <option value="Latex / Material">Latex / Medical Material</option>
                  <option value="Contrast Media">Radiology Contrast Media</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Allergen / Substance Name *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Penicillin, Amoxicillin, Aspirin, Ibuprofen, Peanuts..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reaction" className="text-xs font-semibold">
                  Observed Adverse Reaction
                </Label>
                <Input
                  id="reaction"
                  placeholder="e.g. Severe Urticaria, Facial Swelling, Dyspnea, Anaphylactic shock..."
                  value={formData.reaction}
                  onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="severity" className="text-xs font-semibold">
                  Reaction Severity Level
                </Label>
                <Select
                  id="severity"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="h-9 text-xs"
                >
                  <option value="Critical / Anaphylaxis">Critical / Anaphylaxis (Life-Threatening)</option>
                  <option value="Severe">Severe (Hospitalization Required)</option>
                  <option value="Moderate">Moderate (Rash, Wheezing, Vomiting)</option>
                  <option value="Mild">Mild (Localized Itching, Mild Rash)</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="details" className="text-xs font-semibold">
                  Clinical Notes / Contraindication Advice
                </Label>
                <Textarea
                  id="details"
                  rows={2}
                  placeholder="e.g. Avoid all beta-lactam antibiotics. Cross-reactivity warning with Cephalosporins..."
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
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Record Allergy
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
