"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  FileCheck2,
  AlertTriangle,
  FileText,
  Loader2,
  Scan,
  Images
} from "lucide-react";

export default function ReportVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[450px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ReportVerificationContent />
    </Suspense>
  );
}

function ReportVerificationContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Verification Modal
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [verifierName, setVerifierName] = useState("Dr. S. Mukherjee, MD Radiodiagnosis");
  const [authorizing, setAuthorizing] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch("/api/radiology/studies");
      const data = await res.json();
      if (data.success) {
        // Filter studies with drafted reports or awaiting verification
        const list = (data.data || []).filter(
          (s: any) => s.status === "REPORT_DRAFTED" || (s.findings && s.status !== "FINALIZED")
        );
        setStudies(list);
      }
    } catch (e) {
      toast("Failed to load studies for verification", "error");
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

  const handleAuthorizeReport = async () => {
    if (!selectedStudy) return;

    setAuthorizing(true);
    try {
      const payload = {
        verifiedBy: verifierName,
        verifiedAt: new Date(),
        status: "FINALIZED"
      };

      const res = await fetch(`/api/radiology/studies/${selectedStudy._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // Also update the parent order status to COMPLETED if linked
      if (selectedStudy.order?._id) {
        await fetch(`/api/radiology/orders/${selectedStudy.order._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "COMPLETED" })
        });
      }

      if (res.ok && data.success) {
        toast(`Report authorized & certified for Accession #${selectedStudy.accessionNumber}!`, "success");
        setSelectedStudy(null);
        loadData();
      } else {
        toast(data.message || "Failed to authorize report", "error");
      }
    } catch (e) {
      toast("Error authorizing report", "error");
    } finally {
      setAuthorizing(false);
    }
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
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Radiology Report Peer Review & Verification Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Consultant radiologist electronic signature, diagnostic accuracy verification, and certified report publication.
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
        </div>
      </div>

      {/* Verification Queue */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Reports Awaiting Verification</CardTitle>
          <CardDescription>
            {studies.length} diagnostic studies have completed findings ready for peer authorization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Accession #</TableHead>
                  <TableHead>Patient Particulars</TableHead>
                  <TableHead>Modality & Region</TableHead>
                  <TableHead>Diagnostic Impression</TableHead>
                  <TableHead>Critical Flag</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12 text-xs">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                      All radiology reports have been reviewed and verified. Clean inbox!
                    </TableCell>
                  </TableRow>
                ) : (
                  studies.map((s) => (
                    <TableRow key={s._id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                        {s.accessionNumber || `RAD-${s._id.slice(-6).toUpperCase()}`}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {s.patient?.name || "Patient"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.patient?.uhid}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {s.modality || "X-RAY"}
                        </Badge>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{s.bodyPart || "Chest"}</span>
                      </TableCell>

                      <TableCell className="max-w-md truncate font-medium text-slate-800 dark:text-slate-200">
                        {s.impression || "Drafted findings available for review..."}
                      </TableCell>

                      <TableCell>
                        {s.isCritical ? (
                          <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px]">
                            Critical Alert
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-slate-400">Routine</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 ml-auto"
                          onClick={() => setSelectedStudy(s)}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Review & Sign
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

      {/* Review & Authorization Modal */}
      <Dialog open={!!selectedStudy} onOpenChange={() => setSelectedStudy(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStudy && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Review & Authorize Report — {selectedStudy.accessionNumber}
                </DialogTitle>
                <DialogDescription>
                  Patient: {selectedStudy.patient?.name} ({selectedStudy.patient?.uhid}) • {selectedStudy.modality} {selectedStudy.bodyPart}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border space-y-1.5">
                  <div className="font-semibold text-slate-500 text-[11px]">TECHNIQUE:</div>
                  <div className="text-slate-800 dark:text-slate-200">
                    {selectedStudy.technique || "Standard diagnostic imaging technique."}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border space-y-1.5">
                  <div className="font-semibold text-slate-500 text-[11px]">FINDINGS:</div>
                  <div className="whitespace-pre-line text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                    {selectedStudy.findings || "No findings recorded."}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-1.5">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">
                    IMPRESSION:
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {selectedStudy.impression || "No impression entered."}
                  </div>
                </div>

                {selectedStudy.recommendations && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border space-y-1">
                    <div className="font-semibold text-slate-500 text-[11px]">RECOMMENDATIONS:</div>
                    <div className="text-slate-800 dark:text-slate-200">{selectedStudy.recommendations}</div>
                  </div>
                )}

                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="signatory" className="text-xs font-semibold">
                    Authorized Signatory (Consultant Radiologist) *
                  </Label>
                  <Input
                    id="signatory"
                    value={verifierName}
                    onChange={(e) => setVerifierName(e.target.value)}
                    required
                    className="h-9 text-xs font-medium"
                  />
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedStudy(null)} disabled={authorizing}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={authorizing}
                  onClick={handleAuthorizeReport}
                >
                  {authorizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Sign & Finalize Release
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
