"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  UserPlus,
  Bed,
  Search,
  User,
  Shield,
  Phone,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Building,
  Loader2,
  CheckCircle2
} from "lucide-react";

export default function NewAdmissionPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState("");

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    bedId: "",
    admissionDate: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    admissionType: "ELECTIVE",
    status: "ADMITTED",
    reasonForAdmission: "",
    initialDiagnosis: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    notes: ""
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Patients
        const pRes = await fetch("/api/patient");
        if (pRes.ok) {
          const pData = await pRes.json();
          setPatients(pData.data || []);
        }

        // Fetch Doctors (Users)
        const dRes = await fetch("/api/user");
        if (dRes.ok) {
          const dData = await dRes.json();
          setDoctors(dData.data || []);
        }

        // Fetch Beds
        const bRes = await fetch("/api/bed");
        if (bRes.ok) {
          const bData = await bRes.json();
          // Filter only available beds
          setBeds(bData.data?.filter((b: any) => b.status === "AVAILABLE") || []);
        }
      } catch (err) {
        toast("Failed to load patient, doctor, and bed data", "error");
      } finally {
        setInitialLoading(false);
      }
    }
    fetchData();
  }, []);

  // Selected patient details preview
  const selectedPatient = useMemo(() => {
    return patients.find((p) => p._id === formData.patientId);
  }, [patients, formData.patientId]);

  // Filtered patients for dropdown/search
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const q = patientSearch.toLowerCase();
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.uhid?.toLowerCase().includes(q) ||
        p.contact?.includes(q)
    );
  }, [patients, patientSearch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePatientSelect = (patientId: string) => {
    const p = patients.find((item) => item._id === patientId);
    setFormData((prev) => ({
      ...prev,
      patientId,
      emergencyContactName: p?.emergencyContact || prev.emergencyContactName,
      emergencyContactPhone: p?.contact || prev.emergencyContactPhone
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) {
      toast("Please select a patient to admit", "error");
      return;
    }
    if (!formData.doctorId) {
      toast("Please select an attending doctor", "error");
      return;
    }
    if (!formData.bedId) {
      toast("Please select an available bed", "error");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        bedId: formData.bedId,
        admissionDate: new Date(formData.admissionDate).toISOString(),
        admissionType: formData.admissionType,
        status: "ADMITTED",
        reasonForAdmission: formData.reasonForAdmission,
        initialDiagnosis: formData.initialDiagnosis,
        notes: formData.notes
      };

      if (formData.emergencyContactName || formData.emergencyContactPhone) {
        payload.emergencyContact = {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation
        };
      }

      if (formData.insuranceProvider || formData.insurancePolicyNumber) {
        payload.insurance = {
          provider: formData.insuranceProvider,
          policyNumber: formData.insurancePolicyNumber
        };
      }

      const res = await fetch("/api/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast("Patient admitted successfully and bed status updated to OCCUPIED", "success");
        router.push("/admissions/current");
      } else {
        toast(result.message || "Failed to create admission", "error");
      }
    } catch (err: any) {
      toast(err.message || "An error occurred while creating admission", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-500"
              onClick={() => router.push("/admissions")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Admissions
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            New Patient Admission
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Admit an inpatient, assign attending doctor, and allocate an available hospital bed.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Patient Selection */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              1. Patient Information
            </CardTitle>
            <CardDescription>
              Select an existing registered patient for inpatient admission.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="patientSearch">Search Patient (by Name, UHID, or Phone)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="patientSearch"
                    placeholder="Type name, MED-2026-..., or phone..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="patientId">Select Patient *</Label>
                <Select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  required
                >
                  <option value="">-- Choose Patient ({filteredPatients.length} found) --</option>
                  {filteredPatients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.uhid ? `[${p.uhid}]` : ""} - {p.gender}, {p.age} yrs
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Selected Patient Card Preview */}
            {selectedPatient && (
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      {selectedPatient.name}
                    </span>
                    {selectedPatient.uhid && (
                      <Badge variant="outline" className="text-xs bg-white dark:bg-slate-900">
                        {selectedPatient.uhid}
                      </Badge>
                    )}
                    <Badge className="bg-emerald-600 text-white text-xs">
                      Blood Group: {selectedPatient.bloodGroup || "N/A"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Age: {selectedPatient.age} yrs • Gender: {selectedPatient.gender} • Contact:{" "}
                    {selectedPatient.contact}
                  </p>
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Allergies:{" "}
                      {selectedPatient.allergies.join(", ")}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs bg-white dark:bg-slate-900"
                  onClick={() => window.open(`/patients/profile?id=${selectedPatient._id}`, "_blank")}
                >
                  View Full Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Clinical Admission Details & Bed Allocation */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building className="h-4 w-4 text-emerald-600" />
              2. Ward, Bed & Clinical Assignment
            </CardTitle>
            <CardDescription>
              Assign the attending physician, admission category, and choose an available bed.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor */}
              <div className="space-y-1.5">
                <Label htmlFor="doctorId">Attending Doctor / Consultant *</Label>
                <Select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choose Attending Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.name} ({d.email})
                    </option>
                  ))}
                </Select>
              </div>

              {/* Bed Allocation */}
              <div className="space-y-1.5">
                <Label htmlFor="bedId">
                  Allocated Bed * ({beds.length} available beds)
                </Label>
                <Select
                  id="bedId"
                  name="bedId"
                  value={formData.bedId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Available Bed --</option>
                  {beds.map((b) => (
                    <option key={b._id} value={b._id}>
                      Bed {b.bedNumber} ({b.bedType}) - Room{" "}
                      {b.roomId?.roomNumber || "General"}
                      {b.roomId?.wardId?.wardName ? ` [${b.roomId.wardId.wardName}]` : ""}
                    </option>
                  ))}
                </Select>
                {beds.length === 0 && (
                  <p className="text-xs text-rose-500 mt-1">
                    ⚠️ No beds currently marked as AVAILABLE. Please create or free a bed first.
                  </p>
                )}
              </div>

              {/* Admission Date & Time */}
              <div className="space-y-1.5">
                <Label htmlFor="admissionDate">Admission Date & Time *</Label>
                <Input
                  type="datetime-local"
                  id="admissionDate"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Admission Type */}
              <div className="space-y-1.5">
                <Label htmlFor="admissionType">Admission Type *</Label>
                <Select
                  id="admissionType"
                  name="admissionType"
                  value={formData.admissionType}
                  onChange={handleChange}
                  required
                >
                  <option value="ELECTIVE">Elective / Planned Admission</option>
                  <option value="EMERGENCY">Emergency / Casualty</option>
                  <option value="TRANSFER">Transfer from Other Facility</option>
                  <option value="DAYCARE">Daycare Procedure</option>
                </Select>
              </div>
            </div>

            {/* Diagnosis and Reason */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="reasonForAdmission">Reason for Admission / Chief Complaints</Label>
                <Input
                  id="reasonForAdmission"
                  name="reasonForAdmission"
                  placeholder="e.g. Acute abdominal pain, scheduled cholecystectomy..."
                  value={formData.reasonForAdmission}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="initialDiagnosis">Provisional / Initial Diagnosis</Label>
                <Input
                  id="initialDiagnosis"
                  name="initialDiagnosis"
                  placeholder="e.g. Acute appendicitis, Type 2 DM exacerbation..."
                  value={formData.initialDiagnosis}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Emergency Contact & Insurance */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              3. Emergency Relative & Insurance Details
            </CardTitle>
            <CardDescription>
              Next-of-kin contacts and health insurance policy information (optional).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="emergencyContactName">Relative / Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  placeholder="e.g. John Doe"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyContactPhone">Contact Phone Number</Label>
                <Input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  placeholder="e.g. +1 234 567 890"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyContactRelation">Relationship</Label>
                <Input
                  id="emergencyContactRelation"
                  name="emergencyContactRelation"
                  placeholder="e.g. Spouse, Parent, Sibling"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="insuranceProvider">Insurance Provider / TPA</Label>
                <Input
                  id="insuranceProvider"
                  name="insuranceProvider"
                  placeholder="e.g. BlueCross, Medicare, Star Health..."
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="insurancePolicyNumber">Policy / Card Number</Label>
                <Input
                  id="insurancePolicyNumber"
                  name="insurancePolicyNumber"
                  placeholder="e.g. POL-98234-X"
                  value={formData.insurancePolicyNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Initial Notes */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold">
              4. Clinical & Administrative Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Admission Remarks</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Initial vitals upon arrival, special nursing instructions, dietary requirements, etc."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admissions/current")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading || beds.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[160px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Admitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete Admission
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
