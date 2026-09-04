"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Clock,
  User,
  Calendar,
  Bed,
  FileText,
  Pill,
  FlaskConical,
  Heart,
  Plus,
  Filter,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  Stethoscope
} from "lucide-react";

function PatientHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("id");
  const { toast } = useToast();

  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientIdParam || "");
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Load history data
  useEffect(() => {
    if (!selectedPatientId) return;

    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await fetch(`/api/patient/history?patientId=${selectedPatientId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setHistoryData(data.data);
        } else {
          toast(data.message || "Failed to load medical history", "error");
        }
      } catch (err) {
        toast("Error loading medical history", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [selectedPatientId]);

  // Build combined chronological timeline events
  const timelineEvents = useMemo(() => {
    if (!historyData) return [];

    const events: any[] = [];

    // Appointments
    (historyData.appointments || []).forEach((apt: any) => {
      events.push({
        id: `apt-${apt._id}`,
        type: "APPOINTMENT",
        title: `Appointment with Dr. ${apt.doctorId?.name || "Physician"}`,
        category: apt.type || "CONSULTATION",
        date: new Date(apt.appointmentDate || apt.date || apt.createdAt),
        description: apt.reason || "Outpatient Clinical Consultation",
        badge: apt.status || "CONFIRMED",
        badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        icon: Calendar,
        iconColor: "text-emerald-500 bg-emerald-500/10"
      });
    });

    // Admissions
    (historyData.admissions || []).forEach((adm: any) => {
      events.push({
        id: `adm-${adm._id}`,
        type: "ADMISSION",
        title: `Hospital Admission (${adm.wardId?.name || "Inpatient Ward"})`,
        category: "IPD ADMISSION",
        date: new Date(adm.admissionDate || adm.createdAt),
        description: `Bed Allocated: ${adm.bedId?.bedNumber || "General"} | Status: ${adm.status || "Admitted"}`,
        badge: adm.status || "ADMITTED",
        badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
        icon: Bed,
        iconColor: "text-cyan-500 bg-cyan-500/10"
      });
    });

    // Diagnoses
    (historyData.diagnoses || []).forEach((diag: any) => {
      events.push({
        id: `diag-${diag._id}`,
        type: "DIAGNOSIS",
        title: `Diagnosis: ${diag.diagnosis || diag.title || "Clinical Finding"}`,
        category: "CLINICAL DIAGNOSIS",
        date: new Date(diag.createdAt),
        description: diag.description || diag.notes || "Clinical assessment recorded by attending physician.",
        badge: "DIAGNOSED",
        badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: Stethoscope,
        iconColor: "text-amber-500 bg-amber-500/10"
      });
    });

    // Prescriptions
    (historyData.prescriptions || []).forEach((rx: any) => {
      const medList = Array.isArray(rx.medicines)
        ? rx.medicines.map((m: any) => `${m.name || m.medicineName} (${m.dosage})`).join(", ")
        : "Medication prescribed";
      events.push({
        id: `rx-${rx._id}`,
        type: "PRESCRIPTION",
        title: `Prescription Issued by Dr. ${rx.doctorId?.name || "Doctor"}`,
        category: "PHARMACY",
        date: new Date(rx.createdAt),
        description: medList,
        badge: "PRESCRIBED",
        badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        icon: Pill,
        iconColor: "text-purple-500 bg-purple-500/10"
      });
    });

    // Lab orders
    (historyData.labOrders || []).forEach((lab: any) => {
      events.push({
        id: `lab-${lab._id}`,
        type: "LAB",
        title: `Lab Test: ${lab.testId?.name || lab.testName || "Diagnostic Investigation"}`,
        category: "LABORATORY",
        date: new Date(lab.createdAt),
        description: `Order #${lab._id.slice(-6)} - Test processing and pathology results.`,
        badge: lab.status || "COMPLETED",
        badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        icon: FlaskConical,
        iconColor: "text-indigo-500 bg-indigo-500/10"
      });
    });

    // Vitals
    (historyData.vitalsList || []).forEach((vit: any) => {
      events.push({
        id: `vit-${vit._id}`,
        type: "VITALS",
        title: "Vital Signs Assessment",
        category: "NURSING & TRIAGE",
        date: new Date(vit.recordedAt || vit.createdAt),
        description: `BP: ${vit.bloodPressure || "120/80"} mmHg | Heart Rate: ${vit.heartRate || "72"} bpm | Temp: ${vit.temperature || "98.6"}°F | SpO2: ${vit.spO2 || "99"}%`,
        badge: "RECORDED",
        badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        icon: Heart,
        iconColor: "text-rose-500 bg-rose-500/10"
      });
    });

    // Sort descending by date
    events.sort((a, b) => b.date.getTime() - a.date.getTime());

    return events;
  }, [historyData]);

  // Filtered timeline
  const filteredTimeline = useMemo(() => {
    return timelineEvents.filter((ev) => {
      const matchType = eventTypeFilter === "ALL" || ev.type === eventTypeFilter;
      const matchQuery =
        !searchQuery.trim() ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchQuery;
    });
  }, [timelineEvents, eventTypeFilter, searchQuery]);

  const patient = historyData?.patient;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/patients/list">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Clock className="h-6 w-6 text-emerald-500" />
              Patient Medical History & Timeline
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Longitudinal chronological history of patient encounters, admissions, prescriptions, and diagnoses.
            </p>
          </div>
        </div>

        {/* Patient Picker */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              router.push(`/patients/history?id=${e.target.value}`);
            }}
            className="min-w-64"
          >
            {patientsList.map((p) => (
              <option key={p._id} value={p._id}>
                {p.uhid ? `[${p.uhid}] ` : ""}{p.name}
              </option>
            ))}
          </Select>
          {patient && (
            <Link href={`/patients/profile?id=${patient._id}`}>
              <Button variant="outline" size="sm">
                360° Profile
              </Button>
            </Link>
          )}
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
                {patient.gender} • {patient.age} yrs • Blood: {patient.bloodGroup || "N/A"} • Phone: {patient.contact}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              {timelineEvents.length} Total Events
            </span>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search in clinical notes, diagnoses, tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div>
            <Select value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}>
              <option value="ALL">All Event Types</option>
              <option value="APPOINTMENT">Appointments</option>
              <option value="ADMISSION">Admissions</option>
              <option value="DIAGNOSIS">Diagnoses</option>
              <option value="PRESCRIPTION">Prescriptions</option>
              <option value="LAB">Lab Investigations</option>
              <option value="VITALS">Vital Signs</option>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEventTypeFilter("ALL");
                setSearchQuery("");
              }}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Section */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
            <p className="text-sm">Loading medical history timeline...</p>
          </div>
        ) : filteredTimeline.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">No timeline events found</p>
            <p className="text-xs text-slate-400 mt-1">No medical history entries match your current search or filter.</p>
          </div>
        ) : (
          filteredTimeline.map((ev, index) => {
            const Icon = ev.icon;
            return (
              <div key={ev.id} className="relative group">
                <div
                  className={`absolute -left-[37px] sm:-left-[45px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${ev.iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <Card className="border-slate-200 dark:border-slate-800 transition-all hover:border-emerald-500/40 hover:shadow-md">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{ev.title}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          • {ev.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {ev.date.toLocaleDateString()} {ev.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${ev.badgeColor}`}>
                          {ev.badge}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850/50 p-2.5 rounded-md border border-slate-100 dark:border-slate-800">
                      {ev.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function PatientHistoryPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500 mb-2" />Loading history...</div>}>
      <PatientHistoryContent />
    </Suspense>
  );
}
