"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { GitBranch, ArrowLeft, Loader2, Phone, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useOrganizationStore } from "@/store/useOrganizationStore";

export default function CreateBranchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { organizations, fetchOrganizations, createBranch } = useOrganizationStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    organizationName: "",
    organizationType: "",
    headQuarter: "",
    managerName: "",
    phone: "",
    email: "",
    address: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Filter only MAIN organizations to be parents
  const mainOrganizations = organizations.filter(org => org.branchType === 'MAIN');

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.organizationName.trim()) errs.organizationName = "Branch Name is required";
    if (!form.organizationType) errs.organizationType = "Type is required";
    if (!form.headQuarter) errs.headQuarter = "Parent Organization is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const { success, message } = await createBranch(form);

    setLoading(false);
    if (success) {
      toast(message || "Branch created successfully!", "success");
      router.push("/dashboard/organization/manage");
    } else {
      toast(message || "Failed to create branch", "error");
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Branch</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add a new branch to an existing organization</p>
        </div>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"><GitBranch className="h-5 w-5" /></div>
            <div><CardTitle className="text-base">Branch Details</CardTitle><CardDescription>Enter the information for the new branch</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="branch-name"><span className="flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5 text-slate-400" />Branch Name <span className="text-red-500">*</span></span></Label>
                <Input id="branch-name" placeholder="e.g. Northside Clinic" value={form.organizationName} onChange={(e) => updateField("organizationName", e.target.value)} className={errors.organizationName ? "border-red-500" : ""} />
                {errors.organizationName && <p className="text-xs text-red-500">{errors.organizationName}</p>}
              </div>
              <Select id="branch-org" label="Parent Organization *" value={form.headQuarter} onChange={(e) => updateField("headQuarter", e.target.value)} error={errors.headQuarter}>
                <option value="">Select Organization</option>
                {mainOrganizations.map(org => (
                  <option key={org._id} value={org._id}>{org.organizationName}</option>
                ))}
              </Select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Select id="org-type" label="Branch Type *" value={form.organizationType} onChange={(e) => updateField("organizationType", e.target.value)} error={errors.organizationType}>
                <option value="">Select Type</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="CLINIC">Clinic</option>
                <option value="PHARMACY">Pharmacy</option>
              </Select>
              <div className="space-y-1.5">
                <Label htmlFor="branch-phone"><span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />Branch Phone</span></Label>
                <Input id="branch-phone" type="tel" placeholder="+91 987654321" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="branch-address"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />Branch Address</span></Label>
              <Input id="branch-address" placeholder="456 Branch St, North District, City" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link href="/dashboard/organization/manage"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : <><GitBranch className="h-4 w-4" />Create Branch</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
