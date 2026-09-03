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
  CheckCircle2,
  Loader2,
  Sparkles,
  Scan,
  Radio,
  Layers,
  Activity
} from "lucide-react";

export default function ImagingCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ImagingCatalogContent />
    </Suspense>
  );
}

function ImagingCatalogContent() {
  const { toast } = useToast();
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");

  // Modal
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    modality: "X-RAY",
    bodyPart: "Chest",
    price: "600",
    preparationInstructions: "Remove metallic objects, jewelry and belts.",
    durationMinutes: "15",
    requiresContrast: false
  });

  const fetchProcedures = async () => {
    try {
      const res = await fetch("/api/radiology/procedures");
      const data = await res.json();
      if (data.success) {
        setProcedures(data.data || []);
      }
    } catch (error) {
      toast("Error fetching imaging procedures", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProcedures();
  };

  const handleAddProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast("Please provide procedure name and code", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/radiology/procedures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          durationMinutes: parseInt(formData.durationMinutes) || 15
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Imaging procedure added to catalog successfully!", "success");
        setOpen(false);
        setFormData({
          name: "",
          code: "",
          modality: "X-RAY",
          bodyPart: "Chest",
          price: "600",
          preparationInstructions: "Remove metallic objects, jewelry and belts.",
          durationMinutes: "15",
          requiresContrast: false
        });
        fetchProcedures();
      } else {
        toast(data.message || "Failed to create procedure", "error");
      }
    } catch (error) {
      toast("Error creating procedure", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this imaging procedure from the catalog?")) return;
    try {
      const res = await fetch(`/api/radiology/procedures/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Procedure removed from catalog", "success");
        fetchProcedures();
      } else {
        toast(data.message || "Failed to delete procedure", "error");
      }
    } catch (error) {
      toast("Error deleting procedure", "error");
    }
  };

  // Pre-seed standard hospital imaging procedures if catalog is empty
  const handleSeedDefaults = async () => {
    setSubmitting(true);
    const standardProcedures = [
      { name: "X-Ray Chest PA View", code: "XR-CH-01", modality: "X-RAY", bodyPart: "Chest", price: 600, preparationInstructions: "Remove metallic necklaces & clothing with metal hooks.", durationMinutes: 10, requiresContrast: false },
      { name: "X-Ray Knee Joint AP & Lateral", code: "XR-KN-02", modality: "X-RAY", bodyPart: "Knee Joint", price: 800, preparationInstructions: "Wear loose clothing.", durationMinutes: 10, requiresContrast: false },
      { name: "X-Ray Lumbo-Sacral (LS) Spine AP & Lat", code: "XR-SP-03", modality: "X-RAY", bodyPart: "Spine", price: 950, preparationInstructions: "Bowel clearance recommended before scan.", durationMinutes: 15, requiresContrast: false },
      { name: "NCCT Brain (Non-Contrast Head CT)", code: "CT-BR-01", modality: "CT", bodyPart: "Brain", price: 2500, preparationInstructions: "No specific fasting required.", durationMinutes: 15, requiresContrast: false },
      { name: "CECT Abdomen & Pelvis (Triple Phase)", code: "CT-AB-02", modality: "CT", bodyPart: "Abdomen", price: 5500, preparationInstructions: "4 hours fasting. Serum creatinine report required.", durationMinutes: 30, requiresContrast: true },
      { name: "HRCT Chest (High Resolution CT)", code: "CT-CH-03", modality: "CT", bodyPart: "Chest", price: 3200, preparationInstructions: "Breath hold coaching required before scan.", durationMinutes: 15, requiresContrast: false },
      { name: "MRI Brain (Non-Contrast 3.0T)", code: "MRI-BR-01", modality: "MRI", bodyPart: "Brain", price: 5500, preparationInstructions: "Screen for cardiac pacemakers, surgical clips, metal implants.", durationMinutes: 30, requiresContrast: false },
      { name: "MRI Lumbar Spine with Screening", code: "MRI-SP-02", modality: "MRI", bodyPart: "Spine", price: 6000, preparationInstructions: "Remove all magnetic objects.", durationMinutes: 30, requiresContrast: false },
      { name: "Ultrasound Whole Abdomen & Pelvis", code: "USG-AB-01", modality: "ULTRASOUND", bodyPart: "Abdomen", price: 1200, preparationInstructions: "6 hours fasting, full urinary bladder required.", durationMinutes: 20, requiresContrast: false },
      { name: "Color Doppler Lower Limb Arterial", code: "USG-DP-02", modality: "ULTRASOUND", bodyPart: "Lower Extremity", price: 2800, preparationInstructions: "No special preparation required.", durationMinutes: 30, requiresContrast: false },
      { name: "Digital Mammography Bilateral", code: "MAM-BL-01", modality: "MAMMOGRAPHY", bodyPart: "Breast", price: 2200, preparationInstructions: "Avoid talcum powder and deodorants on scan day.", durationMinutes: 20, requiresContrast: false }
    ];

    try {
      for (const p of standardProcedures) {
        await fetch("/api/radiology/procedures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p)
        });
      }
      toast("Standard radiology procedures populated successfully!", "success");
      fetchProcedures();
    } catch (e) {
      toast("Error populating standard procedures", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProcedures = useMemo(() => {
    return procedures.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q) ||
        (p.bodyPart || "").toLowerCase().includes(q);

      let matchesMod = true;
      if (modalityFilter !== "ALL") {
        matchesMod = p.modality === modalityFilter;
      }

      return matchesSearch && matchesMod;
    });
  }, [procedures, search, modalityFilter]);

  const exportCSV = () => {
    if (filteredProcedures.length === 0) {
      toast("No procedures to export", "error");
      return;
    }

    const headers = [
      "Procedure Code",
      "Procedure Name",
      "Modality",
      "Body Part",
      "Price (INR)",
      "Contrast Required",
      "Duration (Minutes)",
      "Preparation"
    ];

    const rows = filteredProcedures.map((p) => [
      `"${p.code || ""}"`,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${p.modality || ""}"`,
      `"${p.bodyPart || ""}"`,
      p.price || 0,
      p.requiresContrast ? "Yes" : "No",
      p.durationMinutes || 15,
      `"${(p.preparationInstructions || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Imaging_Catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Imaging catalog exported successfully", "success");
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
            Diagnostic Imaging Procedure Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Master directory of X-Ray, CT, MRI, Ultrasound, and Mammography procedures, CPT codes, patient preparation, and tariffs in Indian Rupees (₹).
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

          {procedures.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDefaults}
              disabled={submitting}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Populate Standard Procedures
            </Button>
          )}

          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Procedure
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
                placeholder="Search procedure name, code, body part..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">All Modalities</option>
                <option value="X-RAY">Digital Radiography (X-RAY)</option>
                <option value="CT">Computed Tomography (CT)</option>
                <option value="MRI">Magnetic Resonance (MRI)</option>
                <option value="ULTRASOUND">Ultrasound (USG)</option>
                <option value="MAMMOGRAPHY">Mammography</option>
                <option value="DEXA">DEXA Bone Density</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Diagnostic Imaging Master Directory</CardTitle>
          <CardDescription>
            Showing {filteredProcedures.length} of {procedures.length} radiology examination protocols
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Procedure Name</TableHead>
                  <TableHead>Modality</TableHead>
                  <TableHead>Anatomic Region</TableHead>
                  <TableHead>Contrast</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Price (₹)</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcedures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-12 text-xs">
                      No imaging procedures found. Click "Add Procedure" or "Populate Standard Procedures" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProcedures.map((p) => (
                    <TableRow key={p._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        {p.code}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {p.name}
                        </div>
                        {p.preparationInstructions && (
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            Prep: {p.preparationInstructions}
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            p.modality === "MRI"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                              : p.modality === "CT"
                              ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
                              : p.modality === "ULTRASOUND"
                              ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          }
                        >
                          {p.modality}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                        {p.bodyPart}
                      </TableCell>

                      <TableCell>
                        {p.requiresContrast ? (
                          <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                            IV Contrast
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Plain
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-slate-500 font-mono">
                        {p.durationMinutes || 15} mins
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{p.price}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-rose-600 hover:text-rose-700 ml-auto"
                          onClick={() => handleDelete(p._id)}
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

      {/* Add Procedure Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAddProcedure}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Add Imaging Procedure
              </DialogTitle>
              <DialogDescription>
                Register an examination protocol in the hospital imaging directory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">
                  Procedure Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. X-Ray Chest PA View, MRI Brain"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-xs font-semibold">
                    Procedure Code *
                  </Label>
                  <Input
                    id="code"
                    placeholder="e.g. XR-CH-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="modality" className="text-xs font-semibold">
                    Modality *
                  </Label>
                  <Select
                    id="modality"
                    value={formData.modality}
                    onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="X-RAY">X-Ray (Digital)</option>
                    <option value="CT">Computed Tomography (CT)</option>
                    <option value="MRI">Magnetic Resonance (MRI)</option>
                    <option value="ULTRASOUND">Ultrasound (USG)</option>
                    <option value="MAMMOGRAPHY">Mammography</option>
                    <option value="DEXA">DEXA Scan</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bodyPart" className="text-xs font-semibold">
                    Anatomic Region *
                  </Label>
                  <Input
                    id="bodyPart"
                    placeholder="e.g. Chest, Brain, Abdomen"
                    value={formData.bodyPart}
                    onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs font-semibold">
                    Tariff Price (₹) *
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dur" className="text-xs font-semibold">
                    Estimated Duration (Mins)
                  </Label>
                  <Input
                    type="number"
                    id="dur"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="contrastCheck"
                    checked={formData.requiresContrast}
                    onChange={(e) => setFormData({ ...formData, requiresContrast: e.target.checked })}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <Label htmlFor="contrastCheck" className="text-xs font-medium cursor-pointer">
                    Requires IV Contrast
                  </Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prep" className="text-xs font-semibold">
                  Patient Preparation Guidelines
                </Label>
                <Input
                  id="prep"
                  placeholder="e.g. 4 hours fasting, full bladder, remove metals"
                  value={formData.preparationInstructions}
                  onChange={(e) => setFormData({ ...formData, preparationInstructions: e.target.value })}
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
                    Save Procedure
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
