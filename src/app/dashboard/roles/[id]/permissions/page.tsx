"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Shield, ArrowLeft, Loader2, Plus, X, Check, Save } from "lucide-react";
import Link from "next/link";

const PERMISSION_OPTIONS = ["CREATE", "READ", "UPDATE", "DELETE"] as const;
const DEFAULT_MODULES = [
  "Dashboard", "Patient Management", "Doctor Management", "Appointments",
  "Admissions", "Ward Management", "Inventory", "Billing & Invoices", "Administration"
];

interface ModuleAccess { moduleName: string; permissions: string[]; }
interface RoleData { _id: string; role: string; access: ModuleAccess[]; }

export default function RolePermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Unwrap params using React.use()
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<RoleData | null>(null);
  const [modules, setModules] = useState<ModuleAccess[]>([]);
  const [customModule, setCustomModule] = useState("");

  const fetchRole = useCallback(async () => {
    try {
      const res = await fetch(`/api/role/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setRole(json.data);
        setModules(json.data.access || []);
      } else {
        toast("Failed to load role", "error");
        router.push("/dashboard/roles");
      }
    } catch {
      toast("Error loading role", "error");
    } finally {
      setLoading(false);
    }
  }, [id, router, toast]);

  useEffect(() => { fetchRole(); }, [fetchRole]);

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
      const perms = m.permissions ?? [];
      const has = perms.includes(perm);
      return { ...m, permissions: has ? perms.filter(p => p !== perm) : [...perms, perm] };
    }));
  }

  async function handleSave() {
    if (!role) return;
    if (modules.length === 0) { toast("A role must have at least one module", "warning"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/role/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access: modules }),
      });
      const json = await res.json();
      if (json.success) { toast("Permissions updated successfully", "success"); router.push("/dashboard/roles"); }
      else toast(json.message || "Failed to update permissions", "error");
    } catch { toast("An unexpected error occurred", "error"); } finally { setSaving(false); }
  }

  const availableModules = DEFAULT_MODULES.filter(m => !modules.find(mod => mod.moduleName === m));
  const isSuperAdmin = role?.role === "SUPER_ADMIN";

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/roles"><Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Edit Role Permissions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Modify access permissions for <strong className="text-slate-900 dark:text-slate-200">{role?.role}</strong></p>
        </div>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><Shield className="h-5 w-5" /></div>
              <div><CardTitle className="text-base">Permission Matrix</CardTitle><CardDescription>Configure which modules this role can access and modify</CardDescription></div>
            </div>
            <Button onClick={handleSave} disabled={saving || isSuperAdmin} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {isSuperAdmin && (
             <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 text-amber-800 dark:text-amber-300 text-sm">
                <strong>SUPER_ADMIN</strong> is a built-in role with full system access. Its permissions cannot be modified.
             </div>
          )}

          {/* Add module */}
          {!isSuperAdmin && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">Add Module:</span>
              {availableModules.map(m => (
                <Button key={m} type="button" variant="outline" size="sm" className="gap-1 text-xs" onClick={() => addModule(m)}><Plus className="h-3 w-3" />{m}</Button>
              ))}
              <div className="flex gap-2 ml-auto">
                <Input placeholder="Custom module name..." value={customModule} onChange={(e) => setCustomModule(e.target.value)} className="h-8 text-xs w-48" />
                <Button type="button" variant="outline" size="sm" onClick={() => addModule(customModule)} disabled={!customModule.trim()}><Plus className="h-3 w-3" /></Button>
              </div>
            </div>
          )}

          {/* Module Permission Rows */}
          <div className="space-y-3">
            {modules.map((mod, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/30">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{mod.moduleName}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {PERMISSION_OPTIONS.map(perm => {
                    const active = (mod.permissions ?? []).includes(perm);
                    return (
                      <button key={perm} type="button" onClick={() => !isSuperAdmin && togglePermission(idx, perm)} disabled={isSuperAdmin}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all border ${
                          active ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" : "bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500"
                        } ${isSuperAdmin ? "opacity-70 cursor-not-allowed" : ""}`}>
                        {active && <Check className="h-3.5 w-3.5" />}{perm}
                      </button>
                    );
                  })}
                </div>
                {!isSuperAdmin && (
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 shrink-0 ml-2" onClick={() => removeModule(idx)} title="Remove Module"><X className="h-4 w-4" /></Button>
                )}
              </div>
            ))}
            {modules.length === 0 && !isSuperAdmin && (
               <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">No modules added yet. Add a module to set permissions.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
