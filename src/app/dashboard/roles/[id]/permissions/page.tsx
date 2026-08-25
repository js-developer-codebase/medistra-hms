"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Shield, ArrowLeft, Loader2, Plus, X, Check, Save } from "lucide-react";
import Link from "next/link";

const VALID_PERMISSIONS: Record<string, string[]> = {
  patient: ["patient.patient.view", "patient.patient.create", "patient.patient.update", "patient.patient.delete", "patient.patient.export"],
  appointment: ["appointment.appointment.view", "appointment.appointment.create", "appointment.appointment.update", "appointment.appointment.cancel"],
  admission: ["admission.admission.view", "admission.admission.create", "admission.admission.update", "admission.admission.transfer", "admission.admission.discharge"],
  clinical: ["clinical.record.view", "clinical.record.create", "clinical.record.update", "clinical.record.sign", "clinical.diagnosis.view", "clinical.diagnosis.create", "clinical.diagnosis.update", "clinical.prescription.view", "clinical.prescription.create", "clinical.prescription.update", "clinical.prescription.cancel"],
  nursing: ["nursing.vitals.view", "nursing.vitals.create", "nursing.vitals.update"],
  lab: ["lab.order.view", "lab.order.create", "lab.sample.collect", "lab.result.create", "lab.result.update", "lab.result.verify", "lab.report.publish"],
  radiology: ["radiology.order.view", "radiology.order.create", "radiology.study.perform", "radiology.report.create", "radiology.report.verify", "radiology.report.publish"],
  pharmacy: ["pharmacy.prescription.view", "pharmacy.dispense.create", "pharmacy.dispense.cancel", "pharmacy.stock.view"],
  billing: ["billing.invoice.view", "billing.invoice.create", "billing.invoice.update", "billing.invoice.cancel", "billing.payment.view", "billing.payment.create", "billing.refund.create"],
  inventory: ["inventory.stock.view", "inventory.stock.receive", "inventory.stock.issue", "inventory.stock.transfer", "inventory.stock.adjust"],
  procurement: ["procurement.request.create", "procurement.request.approve", "procurement.order.create", "procurement.order.approve"],
  user: ["user.user.view", "user.user.create", "user.user.update", "user.user.disable"],
  role: ["role.role.view", "role.role.create", "role.role.update", "role.role.delete", "role.role.assign"],
  audit: ["audit.audit.view", "audit.audit.export"],
  system: ["system.settings.view", "system.settings.update"]
};

const DEFAULT_MODULES = Object.keys(VALID_PERMISSIONS);

interface ModuleAccess { moduleName: string; permissions: string[]; }
interface RoleData { _id: string; role: string; access: ModuleAccess[]; }

export default function RolePermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<RoleData | null>(null);
  const [modules, setModules] = useState<ModuleAccess[]>([]);
  
  // State for dropdown selections
  const [selectedPerms, setSelectedPerms] = useState<Record<number, string>>({});

  const fetchRole = useCallback(async () => {
    try {
      const res = await fetch(`/api/role/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setRole(json.data);
        setModules(json.data.access || []);
      } else {
        toast({ title: "Error", description: "Failed to load role", variant: "destructive" });
        router.push("/dashboard/roles");
      }
    } catch {
      toast({ title: "Error", description: "Error loading role", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id, router, toast]);

  useEffect(() => { 
    fetchRole(); 
  }, [fetchRole]);

  function addModule(name: string) {
    if (modules.find(m => m.moduleName === name)) { 
      toast({ title: "Warning", description: "Module already added" }); 
      return; 
    }
    setModules(prev => [...prev, { moduleName: name, permissions: [] }]);
  }

  function removeModule(idx: number) {
    setModules(prev => prev.filter((_, i) => i !== idx));
  }

  function addPermission(idx: number, perm: string) {
    if (!perm) return;
    setModules(prev => prev.map((m, i) => {
      if (i !== idx) return m;
      const perms = m.permissions ?? [];
      if (perms.includes(perm)) return m;
      return { ...m, permissions: [...perms, perm] };
    }));
    // Reset selection for this row
    setSelectedPerms(prev => ({ ...prev, [idx]: "" }));
  }

  function removePermission(idx: number, perm: string) {
    setModules(prev => prev.map((m, i) => {
      if (i !== idx) return m;
      const perms = m.permissions ?? [];
      return { ...m, permissions: perms.filter(p => p !== perm) };
    }));
  }

  async function handleSave() {
    if (!role) return;
    if (modules.length === 0) { 
      toast({ title: "Warning", description: "A role must have at least one module" }); 
      return; 
    }
    setSaving(true);
    try {
      const payload = { access: modules };
      const res = await fetch(`/api/role/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) { 
        toast({ title: "Success", description: "Permissions updated successfully" }); 
        router.push("/dashboard/roles"); 
      }
      else toast({ title: "Error", description: json.message || "Failed to update permissions", variant: "destructive" });
    } catch { 
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" }); 
    } finally { 
      setSaving(false); 
    }
  }

  const availableModules = DEFAULT_MODULES.filter(m => !modules.find(mod => mod.moduleName === m));
  const isSuperAdmin = role?.role === "SYSTEM_SUPER_ADMIN";

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/roles">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="h-4 w-4" />Back
          </Button>
        </Link>
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
                <strong>SYSTEM_SUPER_ADMIN</strong> is a built-in role with full system access. Its permissions cannot be modified.
             </div>
          )}

          {/* Add module */}
          {!isSuperAdmin && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">Add Module:</span>
              {availableModules.map(m => (
                <Button key={m} type="button" variant="outline" size="sm" className="gap-1 text-xs" onClick={() => addModule(m)}><Plus className="h-3 w-3" />{m}</Button>
              ))}
            </div>
          )}

          {/* Module Permission Rows */}
          <div className="space-y-3">
            {modules.map((mod, idx) => {
              const validPerms = VALID_PERMISSIONS[mod.moduleName] || [];
              const availablePermsForModule = validPerms.filter(p => !(mod.permissions || []).includes(p));

              return (
                <div key={idx} className="flex flex-col sm:flex-row gap-4 rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/30">
                  <div className="w-48 shrink-0 pt-1">
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{mod.moduleName}</p>
                    
                    {!isSuperAdmin && (
                      <div className="mt-2 flex gap-2">
                         <select 
                           className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                           value={selectedPerms[idx] || ""}
                           onChange={(e) => setSelectedPerms({ ...selectedPerms, [idx]: e.target.value })}
                         >
                           <option value="" disabled>Select permission...</option>
                           {availablePermsForModule.map(p => <option key={p} value={p}>{p}</option>)}
                         </select>
                         <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={() => addPermission(idx, selectedPerms[idx])} disabled={!selectedPerms[idx]}>
                            Add
                         </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {(mod.permissions ?? []).map(perm => (
                        <div key={perm} className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium bg-emerald-50/50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                          {perm}
                          {!isSuperAdmin && (
                            <button type="button" onClick={() => removePermission(idx, perm)} className="text-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-300"><X className="h-3 w-3" /></button>
                          )}
                        </div>
                      ))}
                      {(mod.permissions ?? []).length === 0 && (
                        <span className="text-xs text-slate-400 italic">No permissions added</span>
                      )}
                    </div>
                  </div>

                  {!isSuperAdmin && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 shrink-0 ml-2" onClick={() => removeModule(idx)} title="Remove Module"><X className="h-4 w-4" /></Button>
                  )}
                </div>
              );
            })}
            
            {modules.length === 0 && !isSuperAdmin && (
               <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">No modules added yet. Add a module to set permissions.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
