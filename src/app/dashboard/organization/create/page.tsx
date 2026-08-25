"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Building2, ArrowLeft, Loader2, Mail, Phone, MapPin, Globe, FileText } from "lucide-react";
import Link from "next/link";
import { useOrganizationStore } from "@/store/useOrganizationStore";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createOrganization } = useOrganizationStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    organizationName: "",
    organizationType: "",
    email: "",
    phone: "",
    address: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.organizationName.trim()) errs.organizationName = "Name is required";
    if (!form.organizationType) errs.organizationType = "Type is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const { success, message } = await createOrganization(form);

    setLoading(false);
    if (success) {
      toast(message || "Organization created successfully!", "success");
      router.push("/dashboard/organization/manage");
    } else {
      toast(message || "Failed to create organization", "error");
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const c = { ...prev }; delete c[field]; return c; });
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/organization/manage"><Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Organization</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add a new organization to the system</p>
        </div>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20"><Building2 className="h-5 w-5" /></div>
            <div><CardTitle className="text-base">Organization Details</CardTitle><CardDescription>Enter the primary information for the organization</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="org-name"><span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" />Organization Name <span className="text-red-500">*</span></span></Label>
                <Input id="org-name" placeholder="e.g. City Hospital Group" value={form.organizationName} onChange={(e) => updateField("organizationName", e.target.value)} className={errors.organizationName ? "border-red-500" : ""} />
                {errors.organizationName && <p className="text-xs text-red-500">{errors.organizationName}</p>}
              </div>
              <Select id="org-type" label="Organization Type *" value={form.organizationType} onChange={(e) => updateField("organizationType", e.target.value)} error={errors.organizationType}>
                <option value="">Select Type</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="CLINIC">Clinic</option>
                <option value="PHARMACY">Pharmacy</option>
              </Select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="org-email"><span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" />Email <span className="text-red-500">*</span></span></Label>
                <Input id="org-email" type="email" placeholder="contact@hospitalgroup.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} className={errors.email ? "border-red-500" : ""} />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org-phone"><span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />Phone <span className="text-red-500">*</span></span></Label>
                <Input id="org-phone" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className={errors.phone ? "border-red-500" : ""} />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="org-address"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />Full Address</span></Label>
              <Input id="org-address" placeholder="123 Health Ave, Medical District, City, Country" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link href="/dashboard/organization/manage"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : <><Building2 className="h-4 w-4" />Create Organization</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
