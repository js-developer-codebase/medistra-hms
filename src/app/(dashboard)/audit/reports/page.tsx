"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  ShieldCheck,
  FileCheck2,
  Download,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Calendar,
  Building2,
  Award,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IComplianceFinding {
  category: string;
  controlName: string;
  status: "PASS" | "FLAG" | "FAIL";
  score: number;
  observation: string;
  recommendation: string;
}

interface IComplianceReportItem {
  _id: string;
  reportId: string;
  framework: string;
  title: string;
  period: string;
  overallScore: number;
  status: string;
  auditDate: string;
  auditorName: string;
  summary: string;
  findings: IComplianceFinding[];
  remediationDeadline?: string;
  createdAt: string;
}

export default function ComplianceReportsPage() {
  const [reports, setReports] = useState<IComplianceReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [frameworkFilter, setFrameworkFilter] = useState("ALL");
  const [selectedReport, setSelectedReport] = useState<IComplianceReportItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [createForm, setCreateForm] = useState({
    reportId: `COMP-${new Date().getFullYear()}-AUDIT-${Math.floor(10 + Math.random() * 90)}`,
    framework: "NABH",
    title: "",
    period: "FY 2024-25 Q3",
    overallScore: 92,
    status: "COMPLIANT",
    auditorName: "Quality & Clinical Governance Cell",
    summary: "",
  });

  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (frameworkFilter !== "ALL") params.append("framework", frameworkFilter);

      const res = await fetch(`/api/audit/reports?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load compliance reports", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [frameworkFilter]);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title) {
      toast({ title: "Validation Error", description: "Report title is required", variant: "destructive" });
      return;
    }
    try {
      setCreating(true);
      const res = await fetch("/api/audit/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          findings: [
            {
              category: "General Governance",
              controlName: "Statutory Policy Enforcement & Audit Trail",
              status: "PASS",
              score: createForm.overallScore,
              observation: "Standard operational parameters validated against statutory mandate.",
              recommendation: "Continue continuous clinical & security monitoring.",
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Report Recorded", description: "Compliance evaluation successfully added." });
        setIsCreateModalOpen(false);
        fetchReports();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to create report", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleExportSummary = () => {
    if (!reports.length) return;
    const content = JSON.stringify(reports, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `medistra_compliance_framework_audit_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Dossier Exported", description: "Compliance framework evaluation JSON exported." });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Compliant
          </Badge>
        );
      case "NEEDS_ATTENTION":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs uppercase font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Needs Attention
          </Badge>
        );
      case "NON_COMPLIANT":
        return (
          <Badge variant="destructive" className="text-xs uppercase font-bold">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Non-Compliant
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-xs uppercase">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl dark:bg-teal-950/50">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Compliance Reports & Regulatory Audits</h1>
              <p className="text-muted-foreground text-sm">
                Accreditation standards evaluation (NABH 5th Ed, HIPAA Security, DISHA/ABDM & ISO 27001)
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportSummary} disabled={loading || !reports.length}>
            <Download className="w-4 h-4 mr-2" />
            Export Dossier
          </Button>
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground shrink-0">Framework:</span>
          <select
            className="flex h-9 w-full sm:w-64 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={frameworkFilter}
            onChange={(e) => setFrameworkFilter(e.target.value)}
          >
            <option value="ALL">All Statutory Frameworks</option>
            <option value="NABH">NABH Hospital Accreditation (India)</option>
            <option value="HIPAA">HIPAA Security & ePHI Privacy</option>
            <option value="DISHA_ABDM">DISHA / Ayushman Bharat (ABDM)</option>
            <option value="ISO_27001">ISO 27001 Information Security</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" /> Loading compliance dossiers...
        </div>
      ) : reports.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground text-sm">
          No compliance reports found for the selected framework.
        </Card>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <Card key={report._id} className="shadow-sm border">
              <CardHeader className="border-b pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg font-bold text-foreground">
                        {report.title}
                      </CardTitle>
                      {getStatusBadge(report.status)}
                    </div>
                    <CardDescription className="text-xs font-mono">
                      Report ID: {report.reportId} • Cycle: {report.period} • Evaluated by {report.auditorName}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">
                        {report.overallScore}%
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Overall Score
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      View Findings ({report.findings?.length || 0})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {report.summary}
                </p>

                {report.findings && report.findings.length > 0 && (
                  <div className="divide-y border rounded-xl overflow-hidden text-xs">
                    {report.findings.slice(0, 3).map((f, idx) => (
                      <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/10">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            {f.status === "PASS" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : f.status === "FLAG" ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                            <span>{f.controlName}</span>
                          </div>
                          <p className="text-muted-foreground text-[11px] line-clamp-1">{f.observation}</p>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                          Score: {f.score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Findings Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" /> Compliance Audit Controls & Findings
            </DialogTitle>
            <DialogDescription>
              {selectedReport?.title} ({selectedReport?.reportId})
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-xl border bg-muted/20 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-foreground text-sm">Overall Compliance: {selectedReport.overallScore}%</span>
                  <p className="text-muted-foreground text-xs mt-0.5">Audited on {new Date(selectedReport.auditDate).toLocaleDateString("en-IN")}</p>
                </div>
                {getStatusBadge(selectedReport.status)}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm">Evaluated Audit Controls:</h4>
                {selectedReport.findings?.map((f, idx) => (
                  <div key={idx} className="p-3 rounded-xl border bg-card text-card-foreground space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {f.status === "PASS" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : f.status === "FLAG" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span>{f.controlName}</span>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">Score: {f.score}%</Badge>
                    </div>
                    <div className="text-muted-foreground text-xs pl-6">
                      <span className="font-medium text-foreground">Observation:</span> {f.observation}
                    </div>
                    <div className="text-xs pl-6 text-primary">
                      <span className="font-medium">Recommendation:</span> {f.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Assessment Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Record Compliance Assessment</DialogTitle>
            <DialogDescription>
              Submit an internal or external regulatory compliance evaluation score.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateReport} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Evaluation Title</Label>
              <Input
                placeholder="e.g. NABH Nursing & Infection Control Audit Q3"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Regulatory Framework</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={createForm.framework}
                  onChange={(e) => setCreateForm({ ...createForm, framework: e.target.value })}
                >
                  <option value="NABH">NABH 5th Edition</option>
                  <option value="HIPAA">HIPAA Security & ePHI</option>
                  <option value="DISHA_ABDM">DISHA / ABDM</option>
                  <option value="ISO_27001">ISO 27001</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Overall Compliance Score (%)</Label>
                <Input
                  type="number"
                  value={createForm.overallScore}
                  onChange={(e) => setCreateForm({ ...createForm, overallScore: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Audit Cycle / Period</Label>
                <Input
                  value={createForm.period}
                  onChange={(e) => setCreateForm({ ...createForm, period: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Compliance Status</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                >
                  <option value="COMPLIANT">Compliant</option>
                  <option value="NEEDS_ATTENTION">Needs Attention</option>
                  <option value="NON_COMPLIANT">Non-Compliant</option>
                  <option value="UNDER_AUDIT">Under Audit</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Auditor / Inspection Cell</Label>
              <Input
                value={createForm.auditorName}
                onChange={(e) => setCreateForm({ ...createForm, auditorName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Executive Assessment Summary</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="High level overview of controls evaluated, findings, and accreditation validity..."
                value={createForm.summary}
                onChange={(e) => setCreateForm({ ...createForm, summary: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Save Evaluation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
