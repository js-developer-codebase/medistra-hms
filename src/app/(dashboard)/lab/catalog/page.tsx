"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  Loader2,
  Sparkles
} from "lucide-react";

export default function TestCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <TestCatalogContent />
    </Suspense>
  );
}

function TestCatalogContent() {
  const { toast } = useToast();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modal
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Hematology",
    price: "450",
    normalRange: "13.5 - 17.5 g/dL",
    turnaroundTime: "2 Hours"
  });

  const fetchTests = async () => {
    try {
      const res = await fetch("/api/lab/tests");
      const data = await res.json();
      if (data.success) {
        setTests(data.data || []);
      }
    } catch (error) {
      toast("Error fetching laboratory tests", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTests();
  };

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast("Please provide test name and code", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/lab/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Diagnostic test added to catalog successfully!", "success");
        setOpen(false);
        setFormData({
          name: "",
          code: "",
          category: "Hematology",
          price: "450",
          normalRange: "",
          turnaroundTime: "2 Hours"
        });
        fetchTests();
      } else {
        toast(data.error || "Failed to create test", "error");
      }
    } catch (error) {
      toast("Error creating test", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this test from the catalog?")) return;
    try {
      const res = await fetch(`/api/lab/tests/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Test removed from catalog", "success");
        fetchTests();
      } else {
        toast(data.error || "Failed to delete test", "error");
      }
    } catch (error) {
      toast("Error deleting test", "error");
    }
  };

  // Pre-seed standard hospital panels if catalog is empty
  const handleSeedDefaults = async () => {
    setSubmitting(true);
    const standardTests = [
      { name: "Complete Blood Count (CBC)", code: "CBC-01", category: "Hematology", price: 350, normalRange: "Hb: 13.5-17.5 g/dL, WBC: 4-11k", turnaroundTime: "2 Hours" },
      { name: "Liver Function Test (LFT)", code: "LFT-01", category: "Biochemistry", price: 650, normalRange: "Bilirubin: 0.2-1.2 mg/dL, SGPT: 7-56 U/L", turnaroundTime: "4 Hours" },
      { name: "Kidney Function Test (KFT)", code: "KFT-01", category: "Biochemistry", price: 600, normalRange: "Creatinine: 0.7-1.3 mg/dL, Urea: 15-45 mg/dL", turnaroundTime: "4 Hours" },
      { name: "Lipid Profile Panel", code: "LIP-01", category: "Biochemistry", price: 750, normalRange: "Total Chol: <200 mg/dL, TG: <150 mg/dL", turnaroundTime: "4 Hours" },
      { name: "Fasting Blood Glucose", code: "GLU-F", category: "Biochemistry", price: 120, normalRange: "70 - 100 mg/dL", turnaroundTime: "1 Hour" },
      { name: "HbA1c Glycated Hemoglobin", code: "HBA1C", category: "Biochemistry", price: 500, normalRange: "< 5.7 %", turnaroundTime: "2 Hours" },
      { name: "Urine Routine & Microscopic", code: "UR-01", category: "Microbiology", price: 200, normalRange: "Clear, pH 5.5-7.0, Protein Nil", turnaroundTime: "1 Hour" },
      { name: "Thyroid Profile (T3, T4, TSH)", code: "THY-01", category: "Serology", price: 850, normalRange: "TSH: 0.4 - 4.0 uIU/mL", turnaroundTime: "6 Hours" }
    ];

    try {
      for (const t of standardTests) {
        await fetch("/api/lab/tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(t)
        });
      }
      toast("Standard diagnostic panels populated successfully!", "success");
      fetchTests();
    } catch (e) {
      toast("Error populating standard tests", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (t.name || "").toLowerCase().includes(q) ||
        (t.code || "").toLowerCase().includes(q);

      let matchesCat = true;
      if (categoryFilter !== "ALL") {
        matchesCat = t.category === categoryFilter;
      }

      return matchesSearch && matchesCat;
    });
  }, [tests, search, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    tests.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tests]);

  const exportCSV = () => {
    if (filteredTests.length === 0) {
      toast("No tests to export", "error");
      return;
    }

    const headers = [
      "Test Code",
      "Test Name",
      "Category",
      "Price",
      "Normal Range",
      "Turnaround Time"
    ];

    const rows = filteredTests.map((t) => [
      `"${t.code || ""}"`,
      `"${(t.name || "").replace(/"/g, '""')}"`,
      `"${t.category || ""}"`,
      t.price || 0,
      `"${(t.normalRange || "").replace(/"/g, '""')}"`,
      `"${t.turnaroundTime || ""}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laboratory_Test_Catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Catalog exported successfully", "success");
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
            <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Laboratory Diagnostic Test Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Master directory of clinical laboratory tests, CPT codes, reference intervals, turnaround times, and pricing.
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

          {tests.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDefaults}
              disabled={submitting}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Populate Standard Tests
            </Button>
          )}

          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Test
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
                placeholder="Search test name, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Diagnostic Test Directory</CardTitle>
          <CardDescription>
            Showing {filteredTests.length} of {tests.length} available laboratory procedures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Code</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reference Range</TableHead>
                  <TableHead>Turnaround</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12 text-xs">
                      No diagnostic tests found. Click "Add Test" or "Populate Standard Tests" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTests.map((t) => (
                    <TableRow key={t._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        {t.code}
                      </TableCell>

                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {t.name}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {t.category}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {t.normalRange || "—"}
                      </TableCell>

                      <TableCell>
                        <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 text-[10px]">
                          {t.turnaroundTime || "Same Day"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold">
                        ${t.price}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-rose-600 hover:text-rose-700 ml-auto"
                          onClick={() => handleDelete(t._id)}
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

      {/* Add Test Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAddTest}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Add Diagnostic Test
              </DialogTitle>
              <DialogDescription>
                Register a new test panel in the hospital laboratory catalog.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">
                  Test Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Complete Blood Count (CBC)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-xs font-semibold">
                    Test Code *
                  </Label>
                  <Input
                    id="code"
                    placeholder="e.g. CBC-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cat" className="text-xs font-semibold">
                    Category *
                  </Label>
                  <Select
                    id="cat"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Serology">Serology / Immunology</option>
                    <option value="Histopathology">Histopathology</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-semibold">
                    Price ($) *
                  </Label>
                  <Input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tat" className="text-xs font-semibold">
                    Turnaround Time
                  </Label>
                  <Input
                    id="tat"
                    placeholder="e.g. 2 Hours, 24 Hours"
                    value={formData.turnaroundTime}
                    onChange={(e) => setFormData({ ...formData, turnaroundTime: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="range" className="text-xs font-semibold">
                  Reference Normal Range / Interval
                </Label>
                <Input
                  id="range"
                  placeholder="e.g. 13.5 - 17.5 g/dL, Negative, 70-100 mg/dL"
                  value={formData.normalRange}
                  onChange={(e) => setFormData({ ...formData, normalRange: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Test
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
