"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  Eye,
  ArrowLeft,
  RefreshCw,
  FolderOpen,
  FileCheck,
  ShieldAlert,
  Search,
  ExternalLink
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  LAB_REPORT: "Laboratory Report",
  PRESCRIPTION: "Prescription",
  DISCHARGE_SUMMARY: "Discharge Summary",
  ID_PROOF: "Government ID Proof",
  CONSENT_FORM: "Patient Consent Form",
  RADIOLOGY: "Radiology & Scan",
  OTHER: "General Medical Document"
};

function PatientDocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("id");
  const { toast } = useToast();


  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientIdParam || "");
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newDoc, setNewDoc] = useState({
    title: "",
    category: "LAB_REPORT" as const,
    fileName: "",
    fileUrl: "",
    notes: ""
  });

  // Load patients
  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch("/api/patient");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPatientsList(data.data);
          if (!patientIdParam && data.data.length > 0) {
            setSelectedPatientId(data.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load patients");
      }
    }
    loadPatients();
  }, [patientIdParam]);

  // Load selected patient documents
  const fetchPatientDocs = async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/patient/${selectedPatientId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPatient(data.data);
      } else {
        toast(data.message || "Failed to load patient records", "error");
      }
    } catch (err) {
      toast("Error fetching documents", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDocs();
  }, [selectedPatientId]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title.trim() && !selectedFile) {
      toast("Document title or file is required", "error");
      return;
    }

    setUploading(true);
    try {
      if (selectedFile) {
        // Multipart upload directly to Storage API
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", newDoc.title || selectedFile.name);
        formData.append("category", newDoc.category);
        formData.append("patientId", selectedPatientId);
        formData.append("notes", newDoc.notes);
        formData.append("folder", "patients");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        const data = await res.json();
        if (res.ok && data.success) {
          toast("File uploaded successfully to storage bucket!", "success");
          setUploadModalOpen(false);
          setSelectedFile(null);
          setNewDoc({ title: "", category: "LAB_REPORT", fileName: "", fileUrl: "", notes: "" });
          fetchPatientDocs();
        } else {
          toast(data.message || "Failed to upload file", "error");
        }
      } else {
        // Link-based upload
        const fileName = newDoc.fileName.trim() || `${newDoc.title.replace(/\s+/g, "_").toLowerCase()}.pdf`;
        const fileUrl = newDoc.fileUrl.trim() || `https://storage.medistra.hospital/docs/${Date.now()}_${fileName}`;

        const res = await fetch(`/api/patient/documents?patientId=${selectedPatientId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newDoc.title,
            category: newDoc.category,
            fileName,
            fileUrl,
            fileSize: "1.4 MB",
            notes: newDoc.notes
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          toast("Document record attached to patient vault", "success");
          setUploadModalOpen(false);
          setNewDoc({ title: "", category: "LAB_REPORT", fileName: "", fileUrl: "", notes: "" });
          fetchPatientDocs();
        } else {
          toast(data.message || "Failed to add document", "error");
        }
      }
    } catch (err) {
      toast("An error occurred during upload", "error");
    } finally {
      setUploading(false);
    }
  };


  const handleDeleteDoc = async (documentId: string, title: string) => {
    if (!confirm(`Delete document "${title}"?`)) return;

    try {
      const res = await fetch(`/api/patient/documents?patientId=${selectedPatientId}&documentId=${documentId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Document deleted successfully", "success");
        fetchPatientDocs();
      } else {
        toast(data.message || "Failed to delete document", "error");
      }
    } catch (err) {
      toast("Error deleting document", "error");
    }
  };

  // Filtered documents
  const documents = patient?.documents || [];
  const filteredDocs = documents.filter((doc: any) => {
    const matchCat = categoryFilter === "ALL" || doc.category === categoryFilter;
    const matchSearch =
      !searchQuery.trim() ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/patients/list">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <FileText className="h-6 w-6 text-emerald-500" />
              Medical Documents Vault
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Secure digital repository for patient pathology reports, prescriptions, scans, and ID proofs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              router.push(`/patients/documents?id=${e.target.value}`);
            }}
            className="min-w-60"
          >
            {patientsList.map((p) => (
              <option key={p._id} value={p._id}>
                {p.uhid ? `[${p.uhid}] ` : ""}{p.name}
              </option>
            ))}
          </Select>

          <Button
            onClick={() => setUploadModalOpen(true)}
            disabled={!selectedPatientId}
            className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap gap-1.5"
          >
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
        </div>
      </div>

      {patient && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
              {patient.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                {patient.name} <span className="text-xs font-mono text-emerald-500">({patient.uhid})</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {patient.gender} • {patient.age} yrs • Blood: {patient.bloodGroup || "N/A"}
              </div>
            </div>
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {documents.length} Files in Vault
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search document title, filename, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="LAB_REPORT">Lab Reports</option>
              <option value="PRESCRIPTION">Prescriptions</option>
              <option value="DISCHARGE_SUMMARY">Discharge Summaries</option>
              <option value="RADIOLOGY">Radiology & Scans</option>
              <option value="ID_PROOF">ID Proofs</option>
              <option value="CONSENT_FORM">Consent Forms</option>
              <option value="OTHER">Other Documents</option>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCategoryFilter("ALL");
                setSearchQuery("");
              }}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
          <p className="text-sm">Accessing digital document vault...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 p-12 text-center">
          <FolderOpen className="h-12 w-12 mx-auto text-slate-400 mb-3" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">No documents found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Upload medical reports, discharge notes, or ID cards to store them securely in the patient dossier.
          </p>
          <Button onClick={() => setUploadModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" /> Upload First Document
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc: any) => (
            <Card
              key={doc._id}
              className="border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold truncate max-w-44" title={doc.title}>
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="text-[11px]">
                        {CATEGORY_LABELS[doc.category] || doc.category}
                      </CardDescription>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                    {doc.fileSize || "1.2 MB"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-3">
                {doc.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
                    {doc.notes}
                  </p>
                )}

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  <span className="font-mono text-slate-500 truncate max-w-32">{doc.fileName}</span>
                </div>
              </CardContent>

              <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 rounded-b-xl">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View / Download
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteDoc(doc._id, doc.title)}
                  className="h-7 px-2 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 text-slate-400"
                  title="Delete Document"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-500" />
              Upload Medical Document
            </DialogTitle>
            <DialogDescription>
              Attach a digital medical file to {patient?.name || "the selected patient"}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
            {/* File Picker */}
            <div className="space-y-1.5">
              <Label htmlFor="docFile">Select File to Upload (PDF, PNG, JPG, DOCX)</Label>
              <Input
                id="docFile"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.dcm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    if (!newDoc.title) {
                      setNewDoc((prev) => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
                    }
                  }
                }}
                className="cursor-pointer file:cursor-pointer"
              />
              {selectedFile && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB) — Will be uploaded to Cloud Storage Bucket
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="docTitle">Document Title <span className="text-rose-500">*</span></Label>
              <Input
                id="docTitle"
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                placeholder="e.g. Chest X-Ray Report, Blood Panel"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="docCat">Document Category <span className="text-rose-500">*</span></Label>
              <Select
                id="docCat"
                value={newDoc.category}
                onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as any })}
                required
              >
                <option value="LAB_REPORT">Laboratory Report</option>
                <option value="PRESCRIPTION">Prescription</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                <option value="RADIOLOGY">Radiology / Scan</option>
                <option value="ID_PROOF">Government ID Proof</option>
                <option value="CONSENT_FORM">Consent Form</option>
                <option value="OTHER">General Medical Document</option>
              </Select>
            </div>

            {!selectedFile && (
              <div className="space-y-1.5">
                <Label htmlFor="docUrl">Or Paste External Document URL (Optional)</Label>
                <Input
                  id="docUrl"
                  value={newDoc.fileUrl}
                  onChange={(e) => setNewDoc({ ...newDoc, fileUrl: e.target.value })}
                  placeholder="https://storage.hospital.com/reports/sample.pdf"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="docNotes">Clinical Notes or Description</Label>
              <Textarea
                id="docNotes"
                value={newDoc.notes}
                onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })}
                placeholder="Additional notes about test results, findings..."
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading} className="bg-emerald-600 hover:bg-emerald-700">
                {uploading ? "Uploading to Bucket..." : "Upload & Save to Vault"}
              </Button>
            </DialogFooter>
          </form>

        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PatientDocumentsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500 mb-2" />Loading documents vault...</div>}>
      <PatientDocumentsContent />
    </Suspense>
  );
}

