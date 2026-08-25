"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ShieldPlus, ArrowLeft, Loader2, Plus, X, Check, Users } from "lucide-react";
import Link from "next/link";

const PERMISSION_OPTIONS = ["CREATE", "READ", "UPDATE", "DELETE"] as const;
const DEFAULT_MODULES = [
  "Dashboard", "Patient Management", "Doctor Management", "Appointments",
  "Admissions", "Ward Management", "Inventory", "Billing & Invoices", "Administration"
];

interface ModuleAccess { moduleName: string; permissions: string[]; }
interface RoleInfo { _id: string; role: string; }
interface ManagedRoleAccess { roleId: string; roleName: string; permissions: string[]; }

export default function CreateRolePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleError, setRoleError] = useState("");
  const [modules, setModules] = useState<ModuleAccess[]>([
    { moduleName: DEFAULT_MODULES[0], permissions: ["READ"] }
  ]);
  const [customModule, setCustomModule] = useState("");

  const [allRoles, setAllRoles] = useState<RoleInfo[]>([]);
  const [managedRoles, setManagedRoles] = useState<ManagedRoleAccess[]>([]);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch("/api/role?managedOnly=true");
        const json = await res.json();
        if (json.success) {
          setAllRoles(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    }
    fetchRoles();
  }, []);

  function addModule(name: string) {
    if (!name.trim()) return;
    if (modules.find(m => m.moduleName === name)) { toast("Module already added", "warning"); return; }
    setModules(prev => [...prev, { moduleName: name, permissions: ["READ"] }]);
    setCustomModule("");
  }

  function removeModule(idx: number) {
    setModules(prev => prev.filter((_, i) => i !== idx));
  }

  function togglePermission(idx: number, perm: string) {
    setModules(prev => prev.map((m, i) => {
      if (i !== idx) return m;
      const has = m.permissions.includes(perm);
      return { ...m, permissions: has ? m.permissions.filter(p => p !== perm) : [...m.permissions, perm] };
    }));
  }

  function addManagedRole(roleId: string, roleName: string) {
    if (managedRoles.find(m => m.roleId === roleId)) return;
    setManagedRoles(prev => [...prev, { roleId, roleName, permissions: ["READ"] }]);
  }

  function removeManagedRole(idx: number) {
    setManagedRoles(prev => prev.filter((_, i) => i !== idx));
  }

  function toggleManagedRolePermission(idx: number, perm: string) {
    setManagedRoles(prev => prev.map((m, i) => {
      if (i !== idx) return m;
      const has = m.permissions.includes(perm);
      return { ...m, permissions: has ? m.permissions.filter(p => p !== perm) : [...m.permissions, perm] };
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleName.trim()) { setRoleError("Role name is required"); return; }
    if (modules.length === 0) { toast("Add at least one module", "warning"); return; }
    setLoading(true);
    try {
      const payload = { 
        role: roleName.trim().toUpperCase().replace(/\s+/g, "_"), 
        access: modules,
        managedRoles: managedRoles.map(m => ({ roleId: m.roleId, permissions: m.permissions }))
      };
      const res = await fetch("/api/role", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) { toast("Role created successfully!", "success"); router.push("/dashboard/roles"); }
      else toast(json.message || "Failed to create role", "error");
    } catch { toast("An unexpected error occurred", "error"); } finally { setLoading(false); }
  }

  const availableModules = DEFAULT_MODULES.filter(m => !modules.find(mod => mod.moduleName === m));
  const availableRoles = allRoles.filter(r => !managedRoles.find(m => m.roleId === r._id));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/roles"><Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create New Role</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Define a role with module-level permissions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Name */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><ShieldPlus className="h-5 w-5" /></div>
              <div><CardTitle className="text-base">Role Details</CardTitle><CardDescription>Set the role name and assign permissions</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-w-sm space-y-1.5">
              <Label htmlFor="cr-name">Role Name <span className="text-red-500">*</span></Label>
              <Input id="cr-name" placeholder="e.g. RECEPTIONIST" value={roleName} onChange={(e) => { setRoleName(e.target.value); setRoleError(""); }} className={roleError ? "border-red-500" : ""} />
              {roleError && <p className="text-xs text-red-500">{roleError}</p>}
              <p className="text-xs text-slate-400">Will be auto-formatted to UPPER_SNAKE_CASE</p>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Matrix */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div><CardTitle className="text-base">Module Permissions</CardTitle><CardDescription>Assign CRUD permissions per module</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Add module */}
            <div className="flex gap-2 flex-wrap">
              {availableModules.map(m => (
                <Button key={m} type="button" variant="outline" size="sm" className="gap-1 text-xs" onClick={() => addModule(m)}><Plus className="h-3 w-3" />{m}</Button>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Custom module..." value={customModule} onChange={(e) => setCustomModule(e.target.value)} className="h-8 text-xs w-40" />
                <Button type="button" variant="outline" size="sm" onClick={() => addModule(customModule)} disabled={!customModule.trim()}><Plus className="h-3 w-3" /></Button>
              </div>
            </div>

            {/* Module Permission Rows */}
            {modules.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No modules added yet. Click a module above to add it.</div>
            ) : (
              <div className="space-y-3">
                {modules.map((mod, idx) => (
                  <div key={mod.moduleName} className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{mod.moduleName}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {PERMISSION_OPTIONS.map(perm => {
                        const active = mod.permissions.includes(perm);
                        return (
                          <button key={perm} type="button" onClick={() => togglePermission(idx, perm)}
                            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all border ${
                              active ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" : "bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500"
                            }`}>
                            {active && <Check className="h-3 w-3" />}{perm}
                          </button>
                        );
                      })}
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 shrink-0" onClick={() => removeModule(idx)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Hierarchy (Managed Roles) */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div><CardTitle className="text-base">Role Hierarchy (Managed Roles)</CardTitle><CardDescription>Assign which roles this role can manage (Create/Read/Update/Delete)</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2 flex-wrap">
              {availableRoles.length === 0 && allRoles.length > 0 && <span className="text-sm text-slate-500 mt-2">All roles added</span>}
              {availableRoles.length === 0 && allRoles.length === 0 && <span className="text-sm text-slate-500 mt-2">No roles available (create some roles first)</span>}
              {availableRoles.map(r => (
                <Button key={r._id} type="button" variant="outline" size="sm" className="gap-1 text-xs" onClick={() => addManagedRole(r._id, r.role)}><Plus className="h-3 w-3" />{r.role}</Button>
              ))}
            </div>

            {managedRoles.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No managed roles added. Click a role above to add it.</div>
            ) : (
              <div className="space-y-3">
                {managedRoles.map((mod, idx) => (
                  <div key={mod.roleId} className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/30">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{mod.roleName}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {PERMISSION_OPTIONS.map(perm => {
                        const active = mod.permissions.includes(perm);
                        return (
                          <button key={perm} type="button" onClick={() => toggleManagedRolePermission(idx, perm)}
                            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all border ${
                              active ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" : "bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500"
                            }`}>
                            {active && <Check className="h-3 w-3" />}{perm}
                          </button>
                        );
                      })}
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 shrink-0" onClick={() => removeManagedRole(idx)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/dashboard/roles"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : <><ShieldPlus className="h-4 w-4" />Create Role</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
