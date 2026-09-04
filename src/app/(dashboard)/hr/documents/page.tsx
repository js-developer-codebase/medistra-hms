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
  FileText,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Loader2,
  Calendar,
  ShieldCheck,
  FileCheck,
  ExternalLink,
  Trash2
} from "lucide-react";

interface DocumentItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  documentType: string;
  title: string;
  documentNumber?: string;
  fileUrl: string;
  issueDate?: string;
  expiryDate?: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedBy?: {
    _id: string;
    name: string;
  };
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
}

const DOC_TYPES = [
  "MEDICAL_LICENSE",
  "DEGREE_CERTIFICATE",
  "ID_PROOF",
  "APPOINTMENT_LETTER",
  "EXPERIENCE_CERTIFICATE",
  "POLICE_VERIFICATION",
  "OTHER"
];

export default function HRDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const { toast } = useToast();

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    userId: "",
    documentType: "MEDICAL_LICENSE",
    title: "State Medical Council Registration",
    documentNumber: "WBMC-2026-8891",
    fileUrl: "/documents/sample-credentials.pdf",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Verified against State Council database"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, empRes] = await Promise.all([
        fetch("/api/hr/documents").then((r) => r.json()).catch(() => ({})),
        fetch("/api/hr/employees").then((r) => r.json()).catch(() => ({}))
      ]);

      if (docRes.success && Array.isArray(docRes.data)) {
        setDocuments(docRes.data);
      }
      if (empRes.success && Array.isArray(empRes.data)) {
        setEmployees(empRes.data);
        if (empRes.data[0]?.userId?._id && !formData.userId) {
          setFormData((prev) => ({ ...prev, userId: empRes.data[0].userId._id }));
        }
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const userName = d.userId?.name?.toLowerCase() || "";
      const docTitle = d.title?.toLowerCase() || "";
      const docNum = d.documentNumber?.toLowerCase() || "";
      const q = search.toLowerCase();

      const matchesSearch = !search || userName.includes(q) || docTitle.includes(q) || docNum.includes(q);
      const matchesStatus = selectedStatus === "ALL" || d.verificationStatus === selectedStatus;
      const matchesType = selectedType === "ALL" || d.documentType === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [documents, search, selectedStatus, selectedType]);

  const stats = useMemo(() => {
    const verified = documents.filter((d) => d.verificationStatus === "VERIFIED").length;
    const pending = documents.filter((d) => d.verificationStatus === "PENDING").length;
    const rejected = documents.filter((d) => d.verificationStatus === "REJECTED").length;

    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime();
    const now = Date.now();
    const expiring = documents.filter((d) => {
      if (!d.expiryDate) return false;
      const t = new Date(d.expiryDate).getTime();
      return t > now && t <= thirtyDays;
    }).length;

    return { verified, pending, rejected, expiring };
  }, [documents]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hr/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Compliance document registered successfully!" });
        setIsUploadOpen(false);
        fetchData();
      } else {
        toast({ title: "Error", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to register document", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (status: "VERIFIED" | "REJECTED") => {
    if (!selectedDoc) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/hr/documents/${selectedDoc._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationStatus: status,
          notes: verificationNotes
        })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Updated", description: `Document marked as ${status}.` });
        setIsVerifyOpen(false);
        fetchData();
      } else {
        toast({ title: "Error", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update verification", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/hr/documents/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Deleted", description: "Document removed from vault." });
        fetchData();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete document", variant: "destructive" });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Employee Name", "Role", "Document Type", "Title", "License / Document #", "Issue Date", "Expiry Date", "Verification Status", "Verified On"];
    const rows = filtered.map((d) => [
      `"${d.userId?.name || "N/A"}"`,
      `"${d.userId?.role || "Staff"}"`,
      `"${d.documentType}"`,
      `"${d.title}"`,
      `"${d.documentNumber || "N/A"}"`,
      `"${d.issueDate ? new Date(d.issueDate).toLocaleDateString("en-IN") : "N/A"}"`,
      `"${d.expiryDate ? new Date(d.expiryDate).toLocaleDateString("en-IN") : "N/A"}"`,
      `"${d.verificationStatus}"`,
      `"${d.verifiedAt ? new Date(d.verifiedAt).toLocaleDateString("en-IN") : "N/A"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `staff_compliance_documents_${new Date().toISOString().split("T")[0]}.csv`);
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
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <FileText className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Staff Documents & Compliance Vault
              </h1>
              <p className="text-sm text-muted-foreground">
                Medical licenses, nursing council registrations, identity proofs, police clearances, and statutory credential verification.
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
            Export Vault
          </Button>
          <Button size="sm" onClick={() => setIsUploadOpen(true)} className="gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Verified Credentials
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {loading ? "..." : stats.verified}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Legally audited credentials</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Audit Review
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <FileCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {loading ? "..." : stats.pending}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Awaiting compliance verification</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Expiring Soon (&lt; 30 Days)
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {loading ? "..." : stats.expiring}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Require urgent renewal</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Files in Vault
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : documents.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Registered employee records</div>
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
                placeholder="Search staff name, title, license #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Document Types</option>
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 py-1 bg-background border border-input rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Staff Credential Repository</CardTitle>
          <CardDescription className="text-xs">
            Showing {filtered.length} compliance documents on file
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Credential Type</TableHead>
                  <TableHead>Document Title</TableHead>
                  <TableHead>License / Reg #</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Audit Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                        Loading compliance documents...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      No compliance documents found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((doc) => {
                    const isExpiringSoon =
                      doc.expiryDate &&
                      new Date(doc.expiryDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 &&
                      new Date(doc.expiryDate).getTime() > Date.now();

                    return (
                      <TableRow key={doc._id} className="hover:bg-muted/30 text-xs">
                        <TableCell>
                          <div className="font-semibold text-foreground">{doc.userId?.name || "Staff Member"}</div>
                          <div className="text-[11px] text-muted-foreground">{doc.userId?.role}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {doc.documentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {doc.title}
                        </TableCell>
                        <TableCell className="font-mono text-foreground">
                          {doc.documentNumber || "N/A"}
                        </TableCell>
                        <TableCell>
                          {doc.expiryDate ? (
                            <div className="flex items-center gap-1.5 font-mono">
                              {isExpiringSoon && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
                              <span className={isExpiringSoon ? "text-rose-600 font-semibold" : "text-muted-foreground"}>
                                {new Date(doc.expiryDate).toLocaleDateString("en-IN")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Permanent</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              doc.verificationStatus === "VERIFIED"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : doc.verificationStatus === "PENDING"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            }`}
                          >
                            {doc.verificationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px] text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
                              onClick={() => {
                                setSelectedDoc(doc);
                                setVerificationNotes(doc.notes || "");
                                setIsVerifyOpen(true);
                              }}
                            >
                              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                              Audit
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-500 hover:text-rose-600"
                              onClick={() => handleDelete(doc._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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

      {/* UPLOAD DOCUMENT DIALOG */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register Compliance Document</DialogTitle>
            <DialogDescription>Register an official healthcare license or identity credential.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-3 text-xs">
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
            <div className="space-y-1">
              <Label>Document Category *</Label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                className="w-full h-9 px-3 py-1 bg-background border border-input rounded-md text-xs"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Document Title *</Label>
              <Input
                required
                placeholder="e.g. State Nursing Council Registration"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Registration / License Number</Label>
              <Input
                placeholder="e.g. WBNC-2026-9901"
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                className="uppercase font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Compliance Verification Notes</Label>
              <Input
                placeholder="e.g. Verified with state council portal"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-rose-600 hover:bg-rose-700 text-white">
                {submitting ? "Uploading..." : "Save to Vault"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AUDIT / VERIFY DIALOG */}
      <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Audit Credential Document</DialogTitle>
            <DialogDescription>
              Review and record verification sign-off for {selectedDoc?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
              <div><span className="text-muted-foreground">Staff:</span> <span className="font-semibold text-foreground">{selectedDoc?.userId?.name}</span></div>
              <div><span className="text-muted-foreground">License #:</span> <span className="font-mono text-foreground">{selectedDoc?.documentNumber || "N/A"}</span></div>
              <div><span className="text-muted-foreground">Expiry:</span> <span className="font-mono">{selectedDoc?.expiryDate ? new Date(selectedDoc.expiryDate).toLocaleDateString("en-IN") : "Permanent"}</span></div>
            </div>
            <div className="space-y-1">
              <Label>Auditor Verification Notes</Label>
              <Input
                placeholder="e.g. Verified valid against statutory registration registry"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-3 flex justify-between sm:justify-between">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleVerify("REJECTED")}
                disabled={submitting}
              >
                Reject Credential
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsVerifyOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleVerify("VERIFIED")}
                  disabled={submitting}
                >
                  Verify & Sign Off
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
