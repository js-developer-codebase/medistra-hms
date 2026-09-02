"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  User,
  Heart,
  Calendar,
  Bed,
  FileText,
  Pill,
  FlaskConical,
  Receipt,
  Phone,
  MapPin,
  Shield,
  Clock,
  QrCode,
  Plus,
  RefreshCw,
  ArrowLeft,
  Copy
} from "lucide-react";

function PatientProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const patientIdParam = searchParams.get("id");
  const { toast } = useToast();

  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientIdParam || "");
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "admissions" | "clinical" | "prescriptions" | "lab" | "billing" | "documents">("overview");

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

    async function fetchDossier() {
      setLoading(true);
      try {
        const res = await fetch(`/api/patient/history?patientId=${selectedPatientId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setDossier(data.data);
        } else {
          toast(data.message || "Failed to load patient dossier", "error");
        }
      } catch (err) {
        toast("Error loading patient records", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchDossier();
  }, [selectedPatientId]);

  const copyUhid = () => {
    if (dossier?.patient?.uhid) {
      navigator.clipboard.writeText(dossier.patient.uhid);
      toast("UHID copied to clipboard", "success");
    }
  };

  const patient = dossier?.patient;

  return (
    <div className="p-3 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/patients/list">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <User className="h-6 w-6 text-emerald-500" />
              Patient 360° Dossier
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Complete longitudinal health record, clinical orders, admissions, and billing history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 max-w-sm w-full md:w-auto">
          <Select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              router.push(`/patients/profile?id=${e.target.value}`);
            }}
            className="w-full min-w-64"
          >
            {patientsList.map((p) => (
              <option key={p._id} value={p._id}>
                {p.uhid ? `[${p.uhid}] ` : ""}{p.name} ({p.contact})
              </option>
            ))}
          </Select>
          <Link href="/patients/register">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap">
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
          </Link>
        </div>
      </div>

      {loading && (
        <div className="p-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <RefreshCw className="h-7 w-7 animate-spin mx-auto text-emerald-500" />
          <p className="text-sm">Loading 360° Patient Dossier...</p>
        </div>
      )}

      {!loading && !patient && (
        <Card className="border-slate-200 dark:border-slate-800 p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">No patient selected or record not found.</p>
          <Link href="/patients/register">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Register First Patient</Button>
          </Link>
        </Card>
      )}

      {!loading && patient && (
        <>
          <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-start sm:items-center gap-5">
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white text-2xl font-bold shadow-md shadow-emerald-600/20">
                    {patient.name?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{patient.name}</h2>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-500/30">
                        {patient.gender} • {patient.age} yrs
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-500/30">
                        Blood: {patient.bloodGroup || "Unknown"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-mono">
                      <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                        UHID: <strong className="text-emerald-600 dark:text-emerald-400">{patient.uhid || "MED-PENDING"}</strong>
                        <button onClick={copyUhid} title="Copy UHID" className="hover:text-emerald-600 dark:hover:text-white">
                          <Copy className="h-3 w-3 ml-1" />
                        </button>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-cyan-600 dark:text-cyan-400" /> {patient.contact}
                      </span>
                      {patient.email && (
                        <span>• {patient.email}</span>
                      )}
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3 w-3 text-amber-500" /> {patient.branchId?.organizationName || "Headquarters"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                  <Link href={`/appointments/book?patientId=${patient._id}`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm">
                      <Calendar className="h-3.5 w-3.5" /> Book Appointment
                    </Button>
                  </Link>
                  <Link href={`/admissions/new?patientId=${patient._id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Bed className="h-3.5 w-3.5" /> Admit
                    </Button>
                  </Link>
                  <Link href={`/patients/identification?id=${patient._id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <QrCode className="h-3.5 w-3.5" /> ID Card
                    </Button>
                  </Link>
                  <Link href={`/patients/history?id=${patient._id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Timeline
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>


          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {[
              { id: "overview", label: "Overview & Vitals", icon: User },
              { id: "appointments", label: `Appointments (${dossier?.appointments?.length || 0})`, icon: Calendar },
              { id: "admissions", label: `Admissions (${dossier?.admissions?.length || 0})`, icon: Bed },
              { id: "clinical", label: `Clinical & Diagnoses (${(dossier?.clinicalRecords?.length || 0) + (dossier?.diagnoses?.length || 0)})`, icon: FileText },
              { id: "prescriptions", label: `Prescriptions (${dossier?.prescriptions?.length || 0})`, icon: Pill },
              { id: "lab", label: `Lab Orders (${dossier?.labOrders?.length || 0})`, icon: FlaskConical },
              { id: "billing", label: `Invoices (${dossier?.invoices?.length || 0})`, icon: Receipt },
              { id: "documents", label: `Documents Vault (${patient.documents?.length || 0})`, icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${active
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <Heart className="h-4 w-4" /> Known Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(!patient.allergies || patient.allergies.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No drug or food allergies recorded.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        >
                          ⚠️ {allergy}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Pre-existing Medical History
                    </div>
                    {(!patient.medicalHistory || patient.medicalHistory.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">No chronic medical conditions listed.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {patient.medicalHistory.map((cond: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          >
                            {cond}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Shield className="h-4 w-4 text-indigo-500" /> Emergency Contact & Guardians
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <div className="text-slate-400 font-medium">Emergency Contact Phone</div>
                    <div className="text-sm font-mono font-semibold text-slate-900 dark:text-white">
                      {patient.emergencyContact}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <div className="text-slate-400 font-medium">Next of Kin / Guardian</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {patient.guardianName || "Not specified"}{" "}
                      {patient.guardianRelation ? `(${patient.guardianRelation})` : ""}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <div className="text-slate-400 font-medium">Identification Document</div>
                    <div className="text-sm font-mono font-semibold text-slate-900 dark:text-white">
                      {patient.identificationType}: {patient.identificationNumber || "Not recorded"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Heart className="h-4 w-4 text-emerald-500" /> Latest Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(!dossier?.vitalsList || dossier.vitalsList.length === 0) ? (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      No vitals recorded yet.
                    </div>
                  ) : (
                    (() => {
                      const latest = dossier.vitalsList[0];
                      return (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <div className="text-slate-400 text-[10px]">Blood Pressure</div>
                            <div className="text-sm font-bold text-emerald-500">{latest.bloodPressure || "120/80"} mmHg</div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
                            <div className="text-slate-400 text-[10px]">Heart Rate</div>
                            <div className="text-sm font-bold text-cyan-500">{latest.heartRate || latest.pulse || "72"} bpm</div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                            <div className="text-slate-400 text-[10px]">Temperature</div>
                            <div className="text-sm font-bold text-amber-500">{latest.temperature || "98.6"} °F</div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center">
                            <div className="text-slate-400 text-[10px]">SpO2</div>
                            <div className="text-sm font-bold text-indigo-500">{latest.spO2 || "99"} %</div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 md:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" /> Residential Address & Geographic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg">
                    {patient.address || "No address provided"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "appointments" && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">Scheduled & Historical Appointments</CardTitle>
                <CardDescription>All OPD appointments registered for this patient.</CardDescription>
              </CardHeader>
              <CardContent>
                {(!dossier?.appointments || dossier.appointments.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No appointment records found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs">
                        <tr>
                          <th className="p-3">Date & Time</th>
                          <th className="p-3">Doctor</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Reason</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {dossier.appointments.map((apt: any) => (
                          <tr key={apt._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-xs">{new Date(apt.appointmentDate || apt.date || apt.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 font-medium">{apt.doctorId?.name || "Assigned Physician"}</td>
                            <td className="p-3 text-xs">{apt.type || "CONSULTATION"}</td>
                            <td className="p-3 text-slate-500 dark:text-slate-400 text-xs">{apt.reason || "Routine checkup"}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                {apt.status || "CONFIRMED"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "admissions" && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">Inpatient (IPD) Admissions</CardTitle>
                <CardDescription>Hospitalization history, ward, and bed assignments.</CardDescription>
              </CardHeader>
              <CardContent>
                {(!dossier?.admissions || dossier.admissions.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No hospitalization/admission records found.</div>
                ) : (
                  <div className="space-y-3">
                    {dossier.admissions.map((adm: any) => (
                      <div key={adm._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-sm text-slate-900 dark:text-white">
                            Admission #{adm.admissionNumber || adm._id.slice(-6)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Ward: {adm.wardId?.name || "General Ward"} • Bed: {adm.bedId?.bedNumber || "B-101"}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Admitted: {new Date(adm.admissionDate || adm.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {adm.status || "DISCHARGED"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "clinical" && (
            <div className="space-y-6">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base">Clinical Notes & Recorded Diagnoses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(!dossier?.diagnoses || dossier.diagnoses.length === 0) && (!dossier?.clinicalRecords || dossier.clinicalRecords.length === 0) ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No clinical notes or diagnoses recorded.</div>
                  ) : (
                    <>
                      {dossier.diagnoses?.map((diag: any) => (
                        <div key={diag._id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                              {diag.diagnosis || diag.title || "Clinical Assessment"}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {new Date(diag.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{diag.description || diag.notes}</p>
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">Medication & Prescription History</CardTitle>
              </CardHeader>
              <CardContent>
                {(!dossier?.prescriptions || dossier.prescriptions.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No prescriptions registered.</div>
                ) : (
                  <div className="space-y-4">
                    {dossier.prescriptions.map((rx: any) => (
                      <div key={rx._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            Doctor: {rx.doctorId?.name || "Treating Physician"}
                          </span>
                          <span className="text-xs text-slate-400">{new Date(rx.createdAt).toLocaleDateString()}</span>
                        </div>
                        {Array.isArray(rx.medicines) && rx.medicines.length > 0 && (
                          <div className="space-y-1.5 pl-3 border-l-2 border-emerald-500">
                            {rx.medicines.map((m: any, idx: number) => (
                              <div key={idx} className="text-xs text-slate-700 dark:text-slate-300">
                                💊 <strong>{m.name || m.medicineName}</strong> — {m.dosage} ({m.frequency || "1-0-1"}) for {m.duration || "5 days"}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "lab" && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">Diagnostic & Laboratory Investigations</CardTitle>
              </CardHeader>
              <CardContent>
                {(!dossier?.labOrders || dossier.labOrders.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No diagnostic lab orders found.</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dossier.labOrders.map((lab: any) => (
                      <div key={lab._id} className="py-3 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-sm text-slate-900 dark:text-white">
                            {lab.testId?.name || lab.testName || "Complete Blood Count (CBC)"}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Ordered: {new Date(lab.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                          {lab.status || "COMPLETED"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "billing" && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">Financial Billing & Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {(!dossier?.invoices || dossier.invoices.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No billing records found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs">
                        <tr>
                          <th className="p-3">Invoice #</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {dossier.invoices.map((inv: any) => (
                          <tr key={inv._id}>
                            <td className="p-3 font-mono text-xs font-bold text-emerald-500">{inv.invoiceNumber || inv._id.slice(-6)}</td>
                            <td className="p-3 text-xs">{new Date(inv.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 font-semibold">₹{(inv.totalAmount || inv.amount || 0).toLocaleString()}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-500">
                                {inv.status || "PAID"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "documents" && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Attached Medical Documents & Scans</CardTitle>
                  <CardDescription>Digital document vault for ID cards, discharge summaries, and test reports.</CardDescription>
                </div>
                <Link href={`/patients/documents?id=${patient._id}`}>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-1" /> Open Document Vault
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {(!patient.documents || patient.documents.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No documents attached yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {patient.documents.map((doc: any) => (
                      <div key={doc._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                        <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{doc.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Category: {doc.category}</div>
                        <div className="text-[11px] text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function PatientProfilePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500 mb-2" />Loading patient dossier...</div>}>
      <PatientProfileContent />
    </Suspense>
  );
}

