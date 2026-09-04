"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  QrCode,
  Printer,
  User,
  Heart,
  Shield,
  Activity,
  ArrowLeft,
  RefreshCw,
  CreditCard,
  Tag,
  Phone,
  Building,
  CheckCircle2
} from "lucide-react";

function PatientIdentificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const patientIdParam = searchParams.get("id");
  const { toast } = useToast();

  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientIdParam || "");
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState<"card" | "wristband">("card");

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

  useEffect(() => {
    if (!selectedPatientId) return;

    async function fetchPatient() {
      setLoading(true);
      try {
        const res = await fetch(`/api/patient/${selectedPatientId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setPatient(data.data);
        } else {
          toast(data.message || "Failed to load patient", "error");
        }
      } catch (err) {
        toast("Error loading patient identification data", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [selectedPatientId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header (hidden in print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/patients/list">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <QrCode className="h-6 w-6 text-emerald-500" />
              Patient Identification & Smart Cards
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Generate and print digital patient ID cards, barcodes, and inpatient identification wristbands.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              router.push(`/patients/identification?id=${e.target.value}`);
            }}
            className="min-w-60"
          >
            {patientsList.map((p) => (
              <option key={p._id} value={p._id}>
                {p.uhid ? `[${p.uhid}] ` : ""}{p.name}
              </option>
            ))}
          </Select>

          <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 whitespace-nowrap">
            <Printer className="h-4 w-4" /> Print Card / Wristband
          </Button>
        </div>
      </div>

      {/* Mode Switcher (hidden in print) */}
      <div className="print:hidden flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Button
          variant={cardType === "card" ? "default" : "outline"}
          size="sm"
          onClick={() => setCardType("card")}
          className={cardType === "card" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          <CreditCard className="h-4 w-4 mr-1.5" /> Patient Smart ID Card
        </Button>
        <Button
          variant={cardType === "wristband" ? "default" : "outline"}
          size="sm"
          onClick={() => setCardType("wristband")}
          className={cardType === "wristband" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          <Tag className="h-4 w-4 mr-1.5" /> Inpatient (IPD) Wristband
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
          <p className="text-sm">Generating identification credentials...</p>
        </div>
      ) : !patient ? (
        <Card className="border-slate-200 dark:border-slate-800 p-12 text-center">
          <p className="text-slate-400 text-sm">Please select a patient to generate their identification badge.</p>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          {/* Card Layout Preview */}
          {cardType === "card" && (
            <div className="space-y-6">
              {/* Front Side */}
              <div className="w-[380px] sm:w-[440px] h-[260px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-5 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                {/* Decorative Background glow */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Top Header Brand */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-wider uppercase text-slate-100">Medistra HMS</div>
                      <div className="text-[9px] text-emerald-400">Patient Health Card</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-emerald-400 font-bold tracking-wider">
                      {patient.uhid || "MED-2026-00000"}
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {patient.branchId?.organizationName || "HQ Branch"}
                    </div>
                  </div>
                </div>

                {/* Card Middle: Avatar & Demographics */}
                <div className="flex items-center gap-4 my-auto">
                  <div className="h-16 w-16 rounded-xl bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-inner">
                    {patient.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <div className="text-base font-bold text-white truncate">{patient.name}</div>
                    <div className="text-xs text-slate-300">
                      {patient.age} yrs • {patient.gender} • <strong className="text-rose-400">Blood: {patient.bloodGroup || "N/A"}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      <Phone className="h-3 w-3 text-cyan-400 shrink-0" /> Emergency: {patient.emergencyContact}
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Barcode representation & Footer */}
                <div className="flex items-end justify-between border-t border-slate-800 pt-3">
                  {/* Simulated barcode */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-0.5 h-6">
                      {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 4, 1, 2].map((w, i) => (
                        <div
                          key={i}
                          className="bg-white h-full"
                          style={{ width: `${w * 1.5}px` }}
                        />
                      ))}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 tracking-widest">{patient.uhid}</div>
                  </div>

                  {/* QR Box representation */}
                  <div className="h-10 w-10 bg-white p-1 rounded-md flex items-center justify-center shrink-0">
                    <QrCode className="h-8 w-8 text-slate-900" />
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 print:hidden">
                Card Dimensions: Standard CR80 Format (85.60 × 53.98 mm)
              </div>
            </div>
          )}

          {/* Wristband Layout Preview */}
          {cardType === "wristband" && (
            <div className="space-y-6">
              <div className="w-[500px] h-[90px] rounded-lg bg-white border-2 border-slate-800 text-slate-900 p-3 shadow-md flex items-center justify-between font-mono">
                {/* Left side: UHID & Barcode */}
                <div className="space-y-1 pr-4 border-r border-slate-300">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Medistra Inpatient</div>
                  <div className="flex items-center gap-0.5 h-6">
                    {[1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 2, 3, 1, 2].map((w, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 h-full"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] font-bold text-slate-900">{patient.uhid}</div>
                </div>

                {/* Middle: Patient Clinical Info */}
                <div className="px-4 space-y-0.5 text-left flex-1 font-sans">
                  <div className="font-bold text-sm text-slate-950 uppercase">{patient.name}</div>
                  <div className="text-xs text-slate-700">
                    {patient.gender} • {patient.age}Y • <strong>Blood: {patient.bloodGroup}</strong>
                  </div>
                  <div className="text-[10px] text-rose-600 font-bold uppercase truncate">
                    Allergies: {patient.allergies?.length ? patient.allergies.join(", ") : "NIL KNOWN"}
                  </div>
                </div>

                {/* Right: QR Code */}
                <div className="pl-4 border-l border-slate-300 flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-slate-900" />
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 print:hidden">
                Inpatient Thermal Wristband Format (250 × 25 mm)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PatientIdentificationPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500 mb-2" />Generating identification...</div>}>
      <PatientIdentificationContent />
    </Suspense>
  );
}

