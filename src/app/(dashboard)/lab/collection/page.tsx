"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  TestTube2,
  Search,
  RefreshCw,
  Download,
  Barcode,
  CheckCircle2,
  Loader2,
  Printer,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function SampleCollectionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <SampleCollectionContent />
    </Suspense>
  );
}

function SampleCollectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams.get("orderId") || "";
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");

  // Collection Action Modal
  const [collectTarget, setCollectTarget] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [collectionData, setCollectionData] = useState({
    sampleType: "Whole Blood (EDTA)",
    sampleCondition: "Adequate",
    sampleCollectedBy: "Phlebotomist Duty Nurse",
    notes: ""
  });

  const loadData = async () => {
    try {
      const res = await fetch("/api/lab/orders");
      const data = await res.json();
      if (data.success) {
        const list = data.data || [];
        setOrders(list);
        if (preselectedOrderId) {
          const found = list.find((o: any) => o._id === preselectedOrderId);
          if (found) {
            setCollectTarget(found);
            setCollectionData((prev) => ({
              ...prev,
              sampleType: found.sampleType || "Whole Blood (EDTA)"
            }));
          }
        }
      }
    } catch (err) {
      toast("Failed to load specimen collection worklist", "error");
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

  const handleConfirmCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectTarget) return;

    setSubmitting(true);
    try {
      const payload = {
        status: "Sample Collected",
        sampleType: collectionData.sampleType,
        sampleCondition: collectionData.sampleCondition,
        sampleCollectedBy: collectionData.sampleCollectedBy,
        sampleCollectedAt: new Date().toISOString()
      };

      const res = await fetch(`/api/lab/orders/${collectTarget._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Specimen for ${collectTarget.patient?.name} collected & labeled successfully!`, "success");
        setCollectTarget(null);
        loadData();
      } else {
        toast(data.error || "Failed to confirm collection", "error");
      }
    } catch (err) {
      toast("Error confirming sample collection", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const patName = (o.patient?.name || "").toLowerCase();
      const uhid = (o.patient?.uhid || "").toLowerCase();
      const barcode = (o.barcode || "").toLowerCase();

      const matchesSearch = !q || patName.includes(q) || uhid.includes(q) || barcode.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = o.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const exportCSV = () => {
    if (filteredOrders.length === 0) {
      toast("No specimen records to export", "error");
      return;
    }

    const headers = [
      "Accession Barcode",
      "Order Date",
      "Patient Name",
      "UHID",
      "Specimen Tube",
      "Specimen Condition",
      "Collected By",
      "Status"
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.barcode || ""}"`,
      `"${new Date(o.orderDate || o.createdAt).toLocaleDateString()}"`,
      `"${o.patient?.name || ""}"`,
      `"${o.patient?.uhid || ""}"`,
      `"${o.sampleType || "Blood"}"`,
      `"${o.sampleCondition || "Adequate"}"`,
      `"${o.sampleCollectedBy || "Phlebotomist"}"`,
      o.status
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Specimen_Collection_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Collection ledger exported successfully", "success");
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
            <TestTube2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Phlebotomy & Sample Collection Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Specimen drawing, barcode tube labeling, sample integrity inspection, and accessioning handover.
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
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search accession barcode, patient name, UHID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="Pending">Awaiting Collection (Pending)</option>
                <option value="Sample Collected">Already Collected</option>
                <option value="ALL">All Specimens</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Worklist Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Phlebotomy Accessioning Worklist</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} specimen collection records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession Barcode</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Required Specimen Tube</TableHead>
                  <TableHead>Tests Included</TableHead>
                  <TableHead>Collection Status</TableHead>
                  <TableHead className="text-right">Phlebotomy Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12 text-xs">
                      No specimens in queue matching current filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((o) => {
                    const isCollected = o.status === "Sample Collected" || o.status === "Processing" || o.status === "Completed";
                    return (
                      <TableRow key={o._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <TableCell>
                          <div className="font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Barcode className="h-4 w-4 text-slate-500" />
                            {o.barcode || `LB-${o._id.slice(-6).toUpperCase()}`}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(o.orderDate || o.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {o.patient?.name || "Patient"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {o.patient?.uhid} • Blood: {o.patient?.bloodGroup || "N/A"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-medium text-rose-700 border-rose-300">
                            {o.sampleType || "Whole Blood (EDTA)"}
                          </Badge>
                          {o.sampleCondition && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Quality: {o.sampleCondition}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                          {o.tests && o.tests.length > 0
                            ? o.tests.map((t: any) => t.name).join(", ")
                            : "Laboratory Panel"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isCollected
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }
                          >
                            {isCollected ? "Sample Collected" : "Pending Draw"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isCollected ? (
                              <Button
                                size="sm"
                                className="h-7 px-2.5 text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1"
                                onClick={() => {
                                  setCollectTarget(o);
                                  setCollectionData((prev) => ({
                                    ...prev,
                                    sampleType: o.sampleType || "Whole Blood (EDTA)"
                                  }));
                                }}
                              >
                                <TestTube2 className="h-3.5 w-3.5" />
                                Draw & Label
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs text-cyan-600 border-cyan-300 hover:bg-cyan-50"
                                onClick={() => router.push(`/lab/processing?orderId=${o._id}`)}
                              >
                                Send to Bench
                              </Button>
                            )}
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

      {/* Collect & Label Modal */}
      <Dialog open={!!collectTarget} onOpenChange={() => setCollectTarget(null)}>
        <DialogContent className="max-w-md">
          {collectTarget && (
            <form onSubmit={handleConfirmCollection}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <TestTube2 className="h-5 w-5 text-rose-600" />
                  Collect Specimen & Print Barcode
                </DialogTitle>
                <DialogDescription>
                  Verify patient identity and confirm specimen collection details.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs">
                {/* Patient Barcode Badge */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {collectTarget.patient?.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      UHID: {collectTarget.patient?.uhid}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-indigo-600">
                      {collectTarget.barcode || `LB-${collectTarget._id.slice(-6).toUpperCase()}`}
                    </div>
                    <Badge variant="outline" className="text-[10px] mt-0.5">
                      {collectTarget.priority}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tube" className="text-xs font-semibold">
                    Specimen Container / Tube Type *
                  </Label>
                  <Select
                    id="tube"
                    value={collectionData.sampleType}
                    onChange={(e) => setCollectionData({ ...collectionData, sampleType: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Whole Blood (EDTA)">Whole Blood (EDTA - Purple Top)</option>
                    <option value="Serum (SST)">Serum (SST - Gold Top)</option>
                    <option value="Plasma (Citrate)">Plasma (Citrate - Blue Top)</option>
                    <option value="Sodium Fluoride (Glucose)">Sodium Fluoride (Grey Top)</option>
                    <option value="Urine (Clean Catch)">Urine (Sterile Cup)</option>
                    <option value="Swab Specimen">Swab / Viral Transport Medium</option>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cond" className="text-xs font-semibold">
                      Specimen Quality
                    </Label>
                    <Select
                      id="cond"
                      value={collectionData.sampleCondition}
                      onChange={(e) => setCollectionData({ ...collectionData, sampleCondition: e.target.value })}
                      className="h-9 text-xs"
                    >
                      <option value="Adequate">Adequate / Optimal</option>
                      <option value="Hemolyzed">Hemolyzed</option>
                      <option value="Lipemic">Lipemic</option>
                      <option value="Clotted">Clotted</option>
                      <option value="Insufficient Volume">Insufficient Volume</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="by" className="text-xs font-semibold">
                      Phlebotomist Name *
                    </Label>
                    <Input
                      id="by"
                      value={collectionData.sampleCollectedBy}
                      onChange={(e) => setCollectionData({ ...collectionData, sampleCollectedBy: e.target.value })}
                      required
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Print Label Mock */}
                <div className="p-3 border border-dashed rounded-lg bg-white dark:bg-slate-900 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <Barcode className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                    <div>
                      <div className="font-mono font-bold">{collectTarget.barcode}</div>
                      <div className="text-[10px] text-slate-400">MEDISTRA LAB • {new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] flex items-center gap-1"
                    onClick={() => toast("Label sent to phlebotomy thermal printer", "info")}
                  >
                    <Printer className="h-3 w-3" />
                    Print Label
                  </Button>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setCollectTarget(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm Collection
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
