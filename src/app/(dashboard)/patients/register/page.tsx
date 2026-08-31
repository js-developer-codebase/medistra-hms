"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { User, Heart, Shield, Phone, MapPin, Plus, X, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "MALE",
    bloodGroup: "O+",
    dateOfBirth: "",
    maritalStatus: "SINGLE",
    contact: "",
    email: "",
    address: "",
    emergencyContact: "",
    guardianName: "",
    guardianRelation: "SPOUSE",
    identificationType: "AADHAAR",
    identificationNumber: "",
    branchId: "",
  });

  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [historyInput, setHistoryInput] = useState("");
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const res = await fetch("/api/org");
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setOrganizations(data.data);
          setFormData((prev) => ({ ...prev, branchId: data.data[0]._id }));
        }
      } catch (err) {
        console.error("Failed to load hospital branches");
      }
    }
    fetchOrganizations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddHistory = () => {
    if (historyInput.trim() && !medicalHistory.includes(historyInput.trim())) {
      setMedicalHistory([...medicalHistory, historyInput.trim()]);
      setHistoryInput("");
    }
  };

  const handleRemoveHistory = (index: number) => {
    setMedicalHistory(medicalHistory.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast("Patient full name is required", "error");
      return;
    }
    if (!formData.age || parseInt(formData.age) < 0) {
      toast("Please enter a valid age", "error");
      return;
    }
    if (!formData.contact.trim()) {
      toast("Contact phone number is required", "error");
      return;
    }
    if (!formData.emergencyContact.trim()) {
      toast("Emergency contact number is required", "error");
      return;
    }
    if (!formData.branchId) {
      toast("Hospital Branch selection is required", "error");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        allergies,
        medicalHistory,
      };

      const response = await fetch("/api/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast(`Patient registered successfully! UHID: ${data.data.uhid}`, "success");
        router.push(`/patients/profile?id=${data.data._id}`);
      } else {
        toast(data.message || "Failed to register patient", "error");
      }
    } catch (error) {
      toast("An unexpected error occurred while saving patient", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/patients/list">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-6 w-6 text-emerald-500" />
              Patient Registration
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create a new digital patient record with automated UHID generation and medical profile.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/patients/list")}>
            Cancel
          </Button>
          <Button type="submit" form="patient-reg-form" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            {loading ? "Registering Patient..." : "Save & Create Patient"}
          </Button>
        </div>
      </div>

      <form id="patient-reg-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Demographics & Personal Info */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <User className="h-4 w-4 text-emerald-500" />
              1. Basic Demographics & Personal Information
            </CardTitle>
            <CardDescription>Legal name, age, gender, blood group and marital status.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Full Name <span className="text-rose-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Chatterjee"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age (Years) <span className="text-rose-500">*</span></Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="32"
                min="0"
                max="140"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender <span className="text-rose-500">*</span></Label>
              <Select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group <span className="text-rose-500">*</span></Label>
              <Select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select id="maritalStatus" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Contact Details & Residence */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Phone className="h-4 w-4 text-cyan-500" />
              2. Contact Information & Residential Address
            </CardTitle>
            <CardDescription>Primary mobile phone, email, and emergency contact details.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="contact">Primary Mobile Number <span className="text-rose-500">*</span></Label>
              <Input
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="+91 98311 00000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact Phone <span className="text-rose-500">*</span></Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="+91 98322 11111"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="address">Residential Address <span className="text-rose-500">*</span></Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full street address, building, city, pin code..."
                rows={2}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Guardian & Government Identification */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Shield className="h-4 w-4 text-indigo-500" />
              3. Next of Kin & Government Identification
            </CardTitle>
            <CardDescription>Guardian details, National identity or Aadhaar verification.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian / Next of Kin Name</Label>
              <Input
                id="guardianName"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="e.g. Meera Chatterjee"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianRelation">Relationship</Label>
              <Select id="guardianRelation" name="guardianRelation" value={formData.guardianRelation} onChange={handleChange}>
                <option value="SPOUSE">Spouse</option>
                <option value="PARENT">Parent / Father / Mother</option>
                <option value="CHILD">Child / Son / Daughter</option>
                <option value="SIBLING">Sibling / Brother / Sister</option>
                <option value="GUARDIAN">Legal Guardian</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identificationType">Identification Type</Label>
              <Select id="identificationType" name="identificationType" value={formData.identificationType} onChange={handleChange}>
                <option value="AADHAAR">Aadhaar Card</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVING_LICENSE">Driving License</option>
                <option value="VOTER_ID">Voter ID Card</option>
                <option value="NATIONAL_ID">National ID / PAN Card</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identificationNumber">Identity Card / Document Number</Label>
              <Input
                id="identificationNumber"
                name="identificationNumber"
                value={formData.identificationNumber}
                onChange={handleChange}
                placeholder="e.g. 5432-8765-9012"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Allergies & Medical History */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <Heart className="h-4 w-4 text-rose-500" />
              4. Known Allergies & Pre-existing Medical Conditions
            </CardTitle>
            <CardDescription>Tag critical drug allergies, food intolerances, and chronic conditions.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies tag input */}
            <div className="space-y-3">
              <Label>Known Allergies (Penicillin, Sulfa, Peanuts, Latex, etc.)</Label>
              <div className="flex gap-2">
                <Input
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  placeholder="Type allergy and click Add"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddAllergy(); } }}
                />
                <Button type="button" variant="outline" onClick={handleAddAllergy}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 min-h-8">
                {allergies.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No known allergies added.</span>
                ) : (
                  allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    >
                      {allergy}
                      <button type="button" onClick={() => handleRemoveAllergy(idx)} className="hover:text-rose-700">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Medical History tag input */}
            <div className="space-y-3">
              <Label>Pre-existing Conditions (Diabetes, Hypertension, Asthma...)</Label>
              <div className="flex gap-2">
                <Input
                  value={historyInput}
                  onChange={(e) => setHistoryInput(e.target.value)}
                  placeholder="Type condition and click Add"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddHistory(); } }}
                />
                <Button type="button" variant="outline" onClick={handleAddHistory}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 min-h-8">
                {medicalHistory.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No prior medical conditions added.</span>
                ) : (
                  medicalHistory.map((cond, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    >
                      {cond}
                      <button type="button" onClick={() => handleRemoveHistory(idx)} className="hover:text-amber-700">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Hospital Facility & Branch */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
              <MapPin className="h-4 w-4 text-emerald-500" />
              5. Hospital Branch Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2 max-w-md">
              <Label htmlFor="branchId">Select Hospital / Branch <span className="text-rose-500">*</span></Label>
              <Select id="branchId" name="branchId" value={formData.branchId} onChange={handleChange} required>
                <option value="" disabled>Select a branch</option>
                {organizations.map((org: any) => (
                  <option key={org._id} value={org._id}>
                    {org.organizationName}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submit Bottom Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => router.push("/patients/list")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-40">
            {loading ? "Registering Patient..." : "Register Patient"}
          </Button>
        </div>
      </form>
    </div>
  );
}
