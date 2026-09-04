"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Files,
  Search,
  Plus,
  RefreshCw,
  FileCheck,
  ExternalLink,
  ShieldCheck,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ClaimDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Upload Document Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [claimId, setClaimId] = useState("");
  const [documentType, setDocumentType] = useState("DISCHARGE_SUMMARY");
  const [documentName, setDocumentName] = useState("");
  const [fileUrl, setFileUrl] = useState("/uploads/insurance/sample_document.pdf");
  const [uploadedBy, setUploadedBy] = useState("TPA Desk Executive");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docRes, patRes, clmRes] = await Promise.all([
        fetch("/api/insurance/documents"),
        fetch("/api/patient"),
        fetch("/api/insurance/claims")
      ]);
      const docData = await docRes.json();
      const patData = await patRes.json();
      const clmData = await clmRes.json();

      if (docData.success) setDocuments(docData.data || []);
      if (patData.success) {
        setPatients(patData.data || []);
        if (patData.data?.length > 0) setPatientId(patData.data[0]._id);
      }
      if (clmData.success) setClaims(clmData.data || []);
    } catch (err: any) {
      toast("Error fetching documents: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !documentName.trim() || !fileUrl.trim()) {
      toast("Please complete all required fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/insurance/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          claimId: claimId || undefined,
          documentType,
          documentName,
          fileUrl,
          uploadedBy
        })
      });
      const data = await res.json();
      if (data.success) {
        toast("Clinical document uploaded and linked to claim dossier!", "success");
        setShowAddModal(false);
        setDocumentName("");
        fetchData();
      } else {
        toast(data.message || "Failed to upload document", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (docId: string) => {
    try {
      const res = await fetch(`/api/insurance/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiedBy: "Senior Medical Auditor" })
      });
      const data = await res.json();
      if (data.success) {
        toast("Document verified for TPA submission", "success");
        fetchData();
      } else {
        toast(data.message || "Verification failed", "error");
      }
    } catch (err: any) {
      toast("Error: " + err.message, "error");
    }
  };

  const filteredDocuments = documents.filter((d) => {
    if (typeFilter !== "ALL" && d.documentType !== typeFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const dNum = (d.documentNumber || "").toLowerCase();
    const dName = (d.documentName || "").toLowerCase();
    const pName = (d.patientId?.name || "").toLowerCase();
    const pUhid = (d.patientId?.uhid || "").toLowerCase();
    return dNum.includes(q) || dName.includes(q) || pName.includes(q) || pUhid.includes(q);
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <Link href="/insurance">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="p-2.5 bg-slate-600/10 text-slate-700 dark:text-slate-200 rounded-xl">
            <Files className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Claim Documents & Clinical Attachments</h1>
            <p className="text-sm text-muted-foreground">
              Clinical case files, discharge summaries, final hospital bills, implant barcodes & KYC dossiers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
            <Plus className="h-4 w-4" />
            Upload Attachment
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents by Name, Document No (DOC-XXXX), or Patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="ALL">All Document Types</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                <option value="FINAL_BILL">Final Itemized Bill</option>
                <option value="PREAUTH_LETTER">Pre-Auth Sanction Letter</option>
                <option value="INVESTIGATION_REPORT">Lab & Investigation Reports</option>
                <option value="PHARMACY_SLIP">Pharmacy Slips</option>
                <option value="IMPLANT_INVOICE">Implant Invoices & Barcodes</option>
                <option value="KYC_DOCUMENT">KYC / Photo ID</option>
                <option value="CLAIM_FORM">Claim Form Part A & B</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground text-left">
                <tr>
                  <th className="py-3 px-4 font-semibold">Document No</th>
                  <th className="py-3 px-4 font-semibold">Document Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Linked Claim</th>
                  <th className="py-3 px-4 font-semibold text-center">Audit Status</th>
                  <th className="py-3 px-4 font-semibold">Uploaded By</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((d: any) => (
                    <tr key={d._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {d.documentNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{d.documentName}</p>
                        <p className="text-[10px] text-muted-foreground">{d.fileSize || "1.2 MB"} &bull; PDF</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {d.documentType?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{d.patientId?.name || "Patient"}</p>
                        <p className="text-[10px] text-muted-foreground">UHID: {d.patientId?.uhid || "N/A"}</p>
                      </td>
                      <td className="py-3 px-4 text-blue-600 font-medium">
                        {d.claimId?.claimNumber || "General Patient Dossier"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {d.verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-amber-600 text-[10px] font-medium">Pending Audit</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {d.uploadedBy || "TPA Desk Executive"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!d.verified && (
                            <Button
                              size="sm"
                              onClick={() => handleVerify(d._id)}
                              className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Verify
                            </Button>
                          )}
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-600 hover:text-blue-600"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted-foreground">
                      {loading ? "Loading clinical attachments..." : "No documents uploaded yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upload Attachment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-xl border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Files className="h-4 w-4 text-slate-700" />
                Upload Clinical Attachment
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Select Patient</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  required
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.uhid || "No UHID"} &bull; {p.contact})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Linked Claim (Optional)</label>
                  <select
                    value={claimId}
                    onChange={(e) => setClaimId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="">None / Pre-Admission Dossier</option>
                    {claims.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.claimNumber} ({c.patientId?.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold">Document Category</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                    <option value="FINAL_BILL">Final Itemized Bill</option>
                    <option value="PREAUTH_LETTER">Pre-Auth Sanction Letter</option>
                    <option value="INVESTIGATION_REPORT">Lab & Investigation Reports</option>
                    <option value="PHARMACY_SLIP">Pharmacy Slips</option>
                    <option value="IMPLANT_INVOICE">Implant Invoices & Barcodes</option>
                    <option value="KYC_DOCUMENT">KYC / Photo ID</option>
                    <option value="CLAIM_FORM">Claim Form Part A & B</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Document Title / Description</label>
                <Input
                  type="text"
                  placeholder="e.g. Discharge Summary signed by Dr. Sen"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">File URL / Storage Path</label>
                <Input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Uploaded By</label>
                <Input
                  type="text"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-800 hover:bg-slate-900 text-white">
                  {submitting ? "Uploading..." : "Save Attachment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
