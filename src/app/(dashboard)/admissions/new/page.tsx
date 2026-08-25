"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

export default function NewAdmissionPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    branchId: "65b3a223f1a23c0012345678", // Dummy branch ID or fetch if available
    bedId: "",
    admissionDate: "",
    admissionType: "ELECTIVE",
    status: "ADMITTED",
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
          setBeds(bData.data?.filter((b: any) => b.status === "AVAILABLE") || []);
        }
      } catch (err) {
        toast("Failed to load initial data", "error");
      }
    }
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          admissionDate: new Date(formData.admissionDate).toISOString()
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast("Admission created successfully", "success");
        router.push("/admissions/current");
      } else {
        toast(result.message || "Failed to create admission", "error");
      }
    } catch (err: any) {
      toast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">New Admission</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Admit a patient to a bed</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admission Details</CardTitle>
          <CardDescription>Enter the admission information carefully.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Patient" name="patientId" value={formData.patientId} onChange={handleChange} required>
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.contact})</option>
                ))}
              </Select>

              <Select label="Doctor" name="doctorId" value={formData.doctorId} onChange={handleChange} required>
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
                ))}
              </Select>

              <Select label="Bed" name="bedId" value={formData.bedId} onChange={handleChange} required>
                <option value="">Select Available Bed</option>
                {beds.map(b => (
                  <option key={b._id} value={b._id}>{b.bedNumber} - {b.bedType}</option>
                ))}
              </Select>

              <div className="space-y-1.5">
                <Label htmlFor="admissionDate">Admission Date & Time</Label>
                <Input
                  type="datetime-local"
                  id="admissionDate"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <Select label="Admission Type" name="admissionType" value={formData.admissionType} onChange={handleChange} required>
                <option value="EMERGENCY">Emergency</option>
                <option value="ELECTIVE">Elective</option>
                <option value="TRANSFER">Transfer</option>
                <option value="DAYCARE">Daycare</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Medical notes, reason for admission, etc."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Admit Patient
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
