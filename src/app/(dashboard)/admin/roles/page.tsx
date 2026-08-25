"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Shield, ShieldPlus, Pencil, Trash2, Loader2, Check } from "lucide-react";
import Link from "next/link";

interface ModuleAccess {
  moduleName: string;
  permissions: string[];
}

interface RoleItem {
  _id: string;
  role: string;
  access: ModuleAccess[];
  createdAt?: string;
}

export default function ManageRolesPage() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/role");
      const json = await res.json();
      if (json.success) setRoles(json.data || []);
    } catch { toast("Failed to load roles", "error"); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/role/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { toast("Role deleted", "success"); setDeleteOpen(false); fetchRoles(); }
      else toast(json.message || "Delete failed", "error");
    } catch { toast("Error deleting role", "error"); } finally { setDeleteLoading(false); }
  }

  const getPermissionsSummary = (roleName: string, access?: ModuleAccess[]) => {
    if (roleName === "SYSTEM_SUPER_ADMIN") return "Full System Access";
    if (!access || access.length === 0) return "No permissions";
    const totalPerms = access.reduce((acc, curr) => acc + (curr.permissions?.length ?? 0), 0);
    return `${access.length} Modules (${totalPerms} permissions)`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Roles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage system roles and permissions</p>
        </div>
        <Link href="/admin/roles/create">
          <Button className="gap-2"><ShieldPlus className="h-4 w-4" />Create New Role</Button>
        </Link>
      </div>

      {/* Content Card */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><Shield className="h-5 w-5" /></div>
            <div><CardTitle className="text-base">All Roles</CardTitle><CardDescription>{roles.length} role{roles.length !== 1 ? "s" : ""} defined</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800/50 animate-pulse" />)}</div>
          ) : roles.length === 0 ? (
            <div className="p-12 text-center"><Shield className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" /><p className="text-sm text-slate-500">No roles found</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Modules Summary</TableHead>
                  <TableHead>Top Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => {
                  const isSuperAdmin = role.role === "SYSTEM_SUPER_ADMIN";
                  const access = role.access ?? [];
                  return (
                    <TableRow key={role._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">{role.role}</span>
                          {isSuperAdmin && <Badge variant="warning" className="text-[10px] uppercase">Built-in</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">{getPermissionsSummary(role.role, access)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                           {isSuperAdmin ? (
                             <Badge variant="default" className="text-[10px]"><Check className="h-3 w-3 mr-1" />All Access</Badge>
                           ) : (
                             access.slice(0, 3).map((a, i) => (
                               <Badge key={i} variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-900">{a.moduleName}</Badge>
                             ))
                           )}
                           {!isSuperAdmin && access.length > 3 && <Badge variant="secondary" className="text-[10px]">+{access.length - 3} more</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/roles/${role._id}/permissions`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600" title="Edit Permissions"><Pencil className="h-3.5 w-3.5" /></Button>
                          </Link>
                          {!isSuperAdmin && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => { setDeleteTarget(role); setDeleteOpen(true); }} title="Delete Role"><Trash2 className="h-3.5 w-3.5" /></Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Role</DialogTitle><DialogDescription>Are you sure you want to delete the <strong>{deleteTarget?.role}</strong> role? Users with this role may lose access.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading} className="gap-2">{deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
