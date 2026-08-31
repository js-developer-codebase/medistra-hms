"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  GitMerge,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Search,
  FileText,
  Clock,
  ShieldCheck
} from "lucide-react";

export default function PatientMergePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryId, setPrimaryId] = useState("");
  const [secondaryId, setSecondaryId] = useState("");
  const [mergeReason, setMergeReason] = useState("Duplicate registration discovered during OPD intake");
  const [merging, setMerging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch("/api/patient?status=active");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPatients(data.data);
          if (data.data.length >= 2) {
            setPrimaryId(data.data[0]._id);
            setSecondaryId(data.data[1]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load patients");
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, []);

  const primaryPatient = patients.find((p) => p._id === primaryId);
  const secondaryPatient = patients.find((p) => p._id === secondaryId);

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!primaryId || !secondaryId) {
      toast("Please select both a primary and secondary patient", "error");
      return;
    }

    if (primaryId === secondaryId) {
      toast("Primary and secondary patient records cannot be the same", "error");
      return;
    }

    if (!mergeReason.trim()) {
      toast("Please provide an audit justification reason for merging", "error");
      return;
    }

    if (!confirmed) {
      toast("Please check the confirmation box to authorize merge", "error");
      return;
    }

    setMerging(true);

    try {
      const response = await fetch("/api/patient/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryPatientId: primaryId,
          secondaryPatientId: secondaryId,
          reason: mergeReason.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast("Patient records successfully merged! Duplicate record deactivated.", "success");
        router.push(`/patients/profile?id=${primaryId}`);
      } else {
        toast(data.message || "Failed to merge patient records", "error");
      }
    } catch (err) {
      toast("An error occurred during the merge process", "error");
    } finally {
      setMerging(false);
    }
  };

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
              <GitMerge className="h-6 w-6 text-emerald-500" />
              Patient Record Deduplication & Merge Tool
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Merge duplicate patient entries into a single master medical record with full clinical migration and audit trail.
            </p>
          </div>
        </div>

        <Link href="/patients/list">
          <Button variant="outline" size="sm">
            Cancel & Return to Directory
          </Button>
        </Link>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-sm">Important Note on Merging Records:</div>
          <p>
            Merging will transfer all medical documents, clinical notes, prescriptions, laboratory orders, and invoices from the <strong>Secondary Patient</strong> into the <strong>Primary Master Patient</strong>.
            The Secondary record will be marked as merged and deactivated to prevent future duplicate bookings.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
          <p className="text-sm">Loading patient registry...</p>
        </div>
      ) : (
        <form onSubmit={handleMergeSubmit} className="space-y-6">
          {/* Side-by-Side Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Secondary Patient Box */}
            <Card className="border-rose-500/30 bg-rose-500/5">
              <CardHeader className="border-b border-rose-500/20 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between text-rose-600 dark:text-rose-400">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    1. Duplicate (Secondary) Patient
                  </span>
                  <span className="text-[11px] font-mono uppercase bg-rose-500/20 px-2 py-0.5 rounded">
                    WILL BE DEACTIVATED
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Select the duplicate profile that will be absorbed into the primary master record.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <Label htmlFor="secondarySelect">Select Duplicate Patient Record</Label>
                  <Select
                    id="secondarySelect"
                    value={secondaryId}
                    onChange={(e) => setSecondaryId(e.target.value)}
                    className="mt-1"
                  >
                    <option value="" disabled>Select patient</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id} disabled={p._id === primaryId}>
                        {p.uhid ? `[${p.uhid}] ` : ""}{p.name} ({p.contact})
                      </option>
                    ))}
                  </Select>
                </div>

                {secondaryPatient && (
                  <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {secondaryPatient.name}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      <div>UHID: <strong className="font-mono text-emerald-500">{secondaryPatient.uhid || "N/A"}</strong></div>
                      <div>Contact: <strong>{secondaryPatient.contact}</strong></div>
                      <div>Age / Gender: <strong>{secondaryPatient.age} yrs / {secondaryPatient.gender}</strong></div>
                      <div>Blood Group: <strong>{secondaryPatient.bloodGroup || "N/A"}</strong></div>
                      <div>Address: <span className="truncate block">{secondaryPatient.address}</span></div>
                      <div>Branch: <strong>{secondaryPatient.branchId?.organizationName || "HQ"}</strong></div>
                      <div>Documents: <strong>{secondaryPatient.documents?.length || 0} files</strong></div>
                      <div>Allergies: <strong>{secondaryPatient.allergies?.length || 0} logged</strong></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Primary Patient Box */}
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="border-b border-emerald-500/20 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    2. Master (Primary) Patient
                  </span>
                  <span className="text-[11px] font-mono uppercase bg-emerald-500/20 px-2 py-0.5 rounded">
                    WILL BE RETAINED
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Select the master patient profile that will preserve the UHID and inherit all data.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <Label htmlFor="primarySelect">Select Master Patient Record</Label>
                  <Select
                    id="primarySelect"
                    value={primaryId}
                    onChange={(e) => setPrimaryId(e.target.value)}
                    className="mt-1"
                  >
                    <option value="" disabled>Select patient</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id} disabled={p._id === secondaryId}>
                        {p.uhid ? `[${p.uhid}] ` : ""}{p.name} ({p.contact})
                      </option>
                    ))}
                  </Select>
                </div>

                {primaryPatient && (
                  <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {primaryPatient.name}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      <div>UHID: <strong className="font-mono text-emerald-500">{primaryPatient.uhid || "N/A"}</strong></div>
                      <div>Contact: <strong>{primaryPatient.contact}</strong></div>
                      <div>Age / Gender: <strong>{primaryPatient.age} yrs / {primaryPatient.gender}</strong></div>
                      <div>Blood Group: <strong>{primaryPatient.bloodGroup || "N/A"}</strong></div>
                      <div>Address: <span className="truncate block">{primaryPatient.address}</span></div>
                      <div>Branch: <strong>{primaryPatient.branchId?.organizationName || "HQ"}</strong></div>
                      <div>Documents: <strong>{primaryPatient.documents?.length || 0} files</strong></div>
                      <div>Allergies: <strong>{primaryPatient.allergies?.length || 0} logged</strong></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Merge Justification & Verification */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-500" />
                3. Audit Justification & Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mergeReason">Reason for Merging <span className="text-rose-500">*</span></Label>
                <Textarea
                  id="mergeReason"
                  value={mergeReason}
                  onChange={(e) => setMergeReason(e.target.value)}
                  placeholder="Specify why these two records are being merged (e.g. Duplicate created by mistake at OPD registration)..."
                  rows={2}
                  required
                />
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="confirmMerge"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="confirmMerge" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  I confirm that I have verified patient demographics (Phone, Government ID, Address) and authorize merging the duplicate record <strong>{secondaryPatient?.name || "Secondary"}</strong> into <strong>{primaryPatient?.name || "Primary"}</strong>.
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => router.push("/patients/list")}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={merging || !confirmed || !primaryId || !secondaryId || primaryId === secondaryId}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-44 gap-2"
                >
                  <GitMerge className="h-4 w-4" />
                  {merging ? "Executing Merge..." : "Execute Patient Merge"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
