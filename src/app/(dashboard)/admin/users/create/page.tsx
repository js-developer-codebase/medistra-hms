"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { UserPlus, ArrowLeft, Loader2, Mail, Lock, Phone, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface RoleOption { _id: string; role: string; }
interface OrganizationOption {
  _id: string;
  organizationName: string;
  branchType: "MAIN" | "BRANCH";
  headQuarter?: string;
}
interface SessionUser {
  role?: string;
  organization?: string | { _id?: string };
  branch?: string | { _id?: string };
}

function idOf(value?: string | { _id?: string } | null): string {
  return typeof value === "object" ? value?._id || "" : value || "";
}

export default function CreateUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", gender: "", phone: "", role: "", organization: "", branch: "", isActive: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [roleRes, orgRes, sessionRes] = await Promise.all([
          fetch("/api/role?permission=CREATE"),
          fetch("/api/org"),
          fetch("/api/auth/session"),
        ]);
        const [roleJson, orgJson, sessionJson] = await Promise.all([
          roleRes.json(),
          orgRes.json(),
          sessionRes.json(),
        ]);

        if (roleJson.success && Array.isArray(roleJson.data)) setRoles(roleJson.data);
        if (orgJson.success && Array.isArray(orgJson.data)) setOrganizations(orgJson.data);

        const currentUser = sessionJson?.user || null;
        setSessionUser(currentUser);
        setForm(prev => ({
          ...prev,
          organization: idOf(currentUser?.organization) || prev.organization,
          branch: idOf(currentUser?.branch) || prev.branch,
        }));
      } catch {
        toast("Failed to load form data", "error");
      } finally {
        setRolesLoading(false);
      }
    }
    loadData();
  }, [toast]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Min 6 characters";
    if (!form.gender) errs.gender = "Gender is required";
    if (!form.role) errs.role = "Role is required";
    if (sessionUser?.organization && !form.organization) errs.organization = "Organization is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        organization: form.organization || undefined,
        branch: form.branch || undefined,
      };
      const res = await fetch("/api/user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) { toast("User created successfully!", "success"); router.push("/admin/users"); }
      else toast(json.message || "Failed to create user", "error");
    } catch { toast("An unexpected error occurred", "error"); } finally { setLoading(false); }
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const c = { ...prev }; delete c[field]; return c; });
  }

  const sessionOrganizationId = idOf(sessionUser?.organization);
  const sessionBranchId = idOf(sessionUser?.branch);
  const organizationOptions = sessionOrganizationId
    ? organizations.filter(org => org._id === sessionOrganizationId)
    : organizations.filter(org => org.branchType === "MAIN");
  const branchOptions = organizations.filter(org => {
    if (org.branchType !== "BRANCH") return false;
    if (sessionBranchId) return org._id === sessionBranchId;
    if (form.organization) return org.headQuarter === form.organization;
    return true;
  });
  const organizationLocked = Boolean(sessionOrganizationId);
  const branchLocked = Boolean(sessionBranchId);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/users"><Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create New User</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add a new user to the hospital management system</p>
        </div>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><UserPlus className="h-5 w-5" /></div>
            <div><CardTitle className="text-base">User Information</CardTitle><CardDescription>Fill in the details for the new user account</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cu-name"><span className="flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5 text-slate-400" />Full Name <span className="text-red-500">*</span></span></Label>
                <Input id="cu-name" placeholder="e.g. Dr. Arup Biswas" value={form.name} onChange={(e) => updateField("name", e.target.value)} className={errors.name ? "border-red-500" : ""} />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cu-email"><span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" />Email <span className="text-red-500">*</span></span></Label>
                <Input id="cu-email" type="email" placeholder="user@hospital.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} className={errors.email ? "border-red-500" : ""} />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cu-pass"><span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-slate-400" />Password <span className="text-red-500">*</span></span></Label>
                <Input id="cu-pass" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => updateField("password", e.target.value)} className={errors.password ? "border-red-500" : ""} />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cu-phone"><span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />Phone</span></Label>
                <Input id="cu-phone" type="tel" placeholder="+91 98300 12345" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Select id="cu-gender" label="Gender *" value={form.gender} onChange={(e) => updateField("gender", e.target.value)} error={errors.gender}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
              </Select>
              <Select id="cu-role" label="Role *" value={form.role} onChange={(e) => updateField("role", e.target.value)} error={errors.role} disabled={rolesLoading}>
                <option value="">{rolesLoading ? "Loading..." : "Select Role"}</option>
                {roles.map((r) => (<option key={r._id} value={r._id}>{r.role}</option>))}
              </Select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                id="cu-organization"
                label="Organization"
                value={form.organization}
                onChange={(e) => setForm(prev => ({ ...prev, organization: e.target.value, branch: "" }))}
                error={errors.organization}
                disabled={organizationLocked}
              >
                <option value="">Select Organization</option>
                {organizationOptions.map((org) => (<option key={org._id} value={org._id}>{org.organizationName}</option>))}
              </Select>
              <Select
                id="cu-branch"
                label="Branch"
                value={form.branch}
                onChange={(e) => updateField("branch", e.target.value)}
                disabled={branchLocked || !form.organization}
              >
                <option value="">No branch</option>
                {branchOptions.map((branch) => (<option key={branch._id} value={branch._id}>{branch.organizationName}</option>))}
              </Select>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex-1"><p className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Status</p><p className="text-xs text-slate-500">Active users can log in</p></div>
              <button type="button" onClick={() => updateField("isActive", !form.isActive)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.isActive ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link href="/admin/users"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : <><UserPlus className="h-4 w-4" />Create User</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
