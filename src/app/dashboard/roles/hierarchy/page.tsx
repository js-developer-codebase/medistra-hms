"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Users, Loader2, Plus, X, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RoleInfo { _id: string; role: string; }
interface HierarchyItem { targetRole: string | RoleInfo; permissions: string[]; }

const HIERARCHY_PERMISSIONS = ["role.assign", "role.create", "INHERIT"];

export default function RoleHierarchyPage() {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [parentRole, setParentRole] = useState<string>("");
  const [hierarchies, setHierarchies] = useState<HierarchyItem[]>([]);
  
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedPerm, setSelectedPerm] = useState("role.assign");

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/role");
      const json = await res.json();
      if (json.success) setRoles(json.data);
    } catch { toast({ title: "Error", description: "Failed to load roles", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const fetchHierarchies = useCallback(async (parentId: string) => {
    if (!parentId) { setHierarchies([]); return; }
    try {
      const res = await fetch(`/api/role-hierarchy?parentRole=${parentId}`);
      const json = await res.json();
      if (json.success) {
        setHierarchies(json.data || []);
      } else {
        toast({ title: "Error", description: "Failed to load hierarchy", variant: "destructive" });
      }
    } catch { toast({ title: "Error", description: "Error loading hierarchy", variant: "destructive" }); }
  }, [toast]);

  useEffect(() => {
    if (parentRole) fetchHierarchies(parentRole);
    else setHierarchies([]);
  }, [parentRole, fetchHierarchies]);

  function addTarget() {
    if (!selectedTarget) return;
    if (hierarchies.find(h => getTargetId(h) === selectedTarget)) {
      toast({ title: "Warning", description: "Target role already in hierarchy" });
      return;
    }
    setHierarchies(prev => [...prev, { targetRole: selectedTarget, permissions: [selectedPerm] }]);
    setSelectedTarget("");
  }

  function removeTarget(idx: number) {
    setHierarchies(prev => prev.filter((_, i) => i !== idx));
  }

  function addPermission(idx: number, perm: string) {
    setHierarchies(prev => prev.map((h, i) => {
      if (i !== idx) return h;
      if (h.permissions.includes(perm)) return h;
      return { ...h, permissions: [...h.permissions, perm] };
    }));
  }

  function removePermission(idx: number, perm: string) {
    setHierarchies(prev => prev.map((h, i) => {
      if (i !== idx) return h;
      return { ...h, permissions: h.permissions.filter(p => p !== perm) };
    }));
  }

  async function handleSave() {
    if (!parentRole) return;
    setSaving(true);
    try {
      const payload = {
        parentRole,
        hierarchies: hierarchies.map(h => ({
          targetRole: getTargetId(h),
          permissions: h.permissions
        }))
      };
      
      const res = await fetch(`/api/role-hierarchy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (json.success) {
        toast({ title: "Success", description: "Hierarchy saved successfully" });
      } else {
        toast({ title: "Error", description: json.message || "Failed to save hierarchy", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Unexpected error saving hierarchy", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const getTargetId = (h: HierarchyItem) => typeof h.targetRole === "object" ? h.targetRole._id : h.targetRole;
  const getTargetName = (h: HierarchyItem) => {
    if (typeof h.targetRole === "object") return h.targetRole.role;
    const found = roles.find(r => r._id === h.targetRole);
    return found ? found.role : h.targetRole;
  };

  const selectedRole = roles.find(r => r._id === parentRole);
  const isSuperAdmin = selectedRole?.role === "SYSTEM_SUPER_ADMIN";
  const availableTargets = roles.filter(r => r._id !== parentRole && !hierarchies.find(h => getTargetId(h) === r._id));

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/roles">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="h-4 w-4" />Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Role Hierarchy</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage administrative relationships and role inheritance</p>
        </div>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><Users className="h-5 w-5" /></div>
              <div>
                <CardTitle className="text-base">Hierarchy Matrix</CardTitle>
                <CardDescription>Select a parent role to configure its managed roles</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select 
                className="h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                value={parentRole}
                onChange={e => setParentRole(e.target.value)}
              >
                <option value="">Select Parent Role...</option>
                {roles.map(r => <option key={r._id} value={r._id}>{r.role}</option>)}
              </select>
              
              <Button onClick={handleSave} disabled={!parentRole || saving || isSuperAdmin} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {!parentRole ? (
             <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                Please select a parent role from the dropdown above to manage its hierarchy.
             </div>
          ) : (
            <>
              {isSuperAdmin && (
                 <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-amber-800 dark:text-amber-300 text-sm">
                    <strong>SYSTEM_SUPER_ADMIN</strong> automatically manages all roles. Manual hierarchy configuration is not permitted.
                 </div>
              )}

              {!isSuperAdmin && (
                <div className="flex gap-2 flex-wrap items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">Add Target Role:</span>
                  
                  <select 
                    className="h-8 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    value={selectedTarget}
                    onChange={e => setSelectedTarget(e.target.value)}
                  >
                    <option value="">Select Target...</option>
                    {availableTargets.map(r => <option key={r._id} value={r._id}>{r.role}</option>)}
                  </select>

                  <select 
                    className="h-8 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    value={selectedPerm}
                    onChange={e => setSelectedPerm(e.target.value)}
                  >
                    {HIERARCHY_PERMISSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>

                  <Button type="button" size="sm" onClick={addTarget} disabled={!selectedTarget} className="h-8 px-3 gap-1">
                     <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {hierarchies.map((h, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-4 rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/30">
                    <div className="w-64 shrink-0 pt-1">
                      <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{getTargetName(h)}</p>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 items-center">
                        {h.permissions.map(perm => (
                          <div key={perm} className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium bg-emerald-50/50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                            {perm}
                            {!isSuperAdmin && (
                              <button type="button" onClick={() => removePermission(idx, perm)} className="text-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-300"><X className="h-3 w-3" /></button>
                            )}
                          </div>
                        ))}

                        {!isSuperAdmin && (
                          <div className="ml-2 relative group flex items-center">
                            <select 
                              className="opacity-0 absolute inset-0 w-full cursor-pointer h-6"
                              onChange={(e) => { addPermission(idx, e.target.value); e.target.value = ""; }}
                              value=""
                            >
                              <option value="" disabled>Add...</option>
                              {HIERARCHY_PERMISSIONS.filter(p => !h.permissions.includes(p)).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <Button type="button" variant="outline" size="sm" className="h-6 text-xs px-2 pointer-events-none group-hover:bg-slate-100 dark:group-hover:bg-slate-800"><Plus className="h-3 w-3 mr-1" /> Add Perm</Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isSuperAdmin && (
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 shrink-0 ml-2" onClick={() => removeTarget(idx)} title="Remove Hierarchy"><X className="h-4 w-4" /></Button>
                    )}
                  </div>
                ))}

                {hierarchies.length === 0 && !isSuperAdmin && (
                  <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">No managed roles assigned yet.</div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
