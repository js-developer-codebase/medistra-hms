"use client";

import React, { useEffect, useState } from "react";
import {
  Key,
  Shield,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  Layers,
  Check,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PermissionsMatrixPage() {
  const { toast } = useToast();
  const [data, setData] = useState<any>({ modules: [], roles: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Inspect Modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState<any>(null);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/permissions");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load permissions matrix", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const filteredModules = (data.modules || []).filter((m: string) =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  const handleInspectModule = (moduleName: string) => {
    const roleGrants = (data.roles || []).map((r: any) => ({
      role: r.role,
      isSuperAdmin: r.isSuperAdmin,
      permissions: r.isSuperAdmin ? ["ALL"] : r.access[moduleName] || [],
    }));
    setInspectItem({ moduleName, roleGrants });
    setInspectModalOpen(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-lg">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">System Permissions Matrix</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Cross-table RBAC authorization heatmap mapping hospital modules against institutional roles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchMatrix} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Legend and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search module (e.g. Pharmacy, Appointments, Patients)..."
            className="pl-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Legend:</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
            C = Create
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
            R = Read
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
            U = Update
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
            D = Delete
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold">
            ★ = Super Admin (Full)
          </span>
        </div>
      </div>

      {/* Permissions Heatmap Table */}
      <Card className="border shadow-sm">
        <CardHeader className="py-3.5 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Module Authorization Matrix ({filteredModules.length} Modules)
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {data.roles?.length || 0} Defined Roles
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading permissions matrix...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left font-medium text-muted-foreground">
                    <th className="py-3 px-4 min-w-[200px]">Hospital Subsystem / Module</th>
                    {data.roles?.map((r: any) => (
                      <th key={r._id} className="py-3 px-3 text-center min-w-[110px]">
                        <span className="font-semibold text-foreground block truncate max-w-[120px]">
                          {r.role}
                        </span>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredModules.map((mod: string) => (
                    <tr key={mod} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                          {mod}
                        </div>
                      </td>

                      {data.roles?.map((r: any) => {
                        if (r.isSuperAdmin) {
                          return (
                            <td key={r._id} className="py-3 px-3 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs" title="Full Super Admin Access">
                                ★
                              </span>
                            </td>
                          );
                        }

                        const perms: string[] = r.access[mod] || [];
                        if (perms.length === 0) {
                          return (
                            <td key={r._id} className="py-3 px-3 text-center text-muted-foreground/40 font-mono">
                              —
                            </td>
                          );
                        }

                        return (
                          <td key={r._id} className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {perms.includes("CREATE") && (
                                <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center">
                                  C
                                </span>
                              )}
                              {perms.includes("READ") && (
                                <span className="w-4 h-4 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center">
                                  R
                                </span>
                              )}
                              {perms.includes("UPDATE") && (
                                <span className="w-4 h-4 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center">
                                  U
                                </span>
                              )}
                              {perms.includes("DELETE") && (
                                <span className="w-4 h-4 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold flex items-center justify-center">
                                  D
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleInspectModule(mod)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspect Module Dialog */}
      <Dialog open={inspectModalOpen} onOpenChange={setInspectModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {inspectItem && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-teal-600" />
                  {inspectItem.moduleName} - Authorization Audit
                </DialogTitle>
                <DialogDescription>
                  Detailed breakdown of role privileges for this hospital subsystem.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4 text-xs">
                <div className="divide-y border rounded-lg overflow-hidden">
                  {inspectItem.roleGrants.map((rg: any) => (
                    <div key={rg.role} className="p-2.5 flex items-center justify-between hover:bg-muted/30">
                      <div>
                        <span className="font-semibold text-foreground">{rg.role}</span>
                        {rg.isSuperAdmin && (
                          <span className="text-[10px] text-purple-600 block">Universal Administrative Grant</span>
                        )}
                      </div>
                      <div>
                        {rg.isSuperAdmin ? (
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            FULL CONTROL
                          </Badge>
                        ) : rg.permissions.length === 0 ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            NO ACCESS
                          </Badge>
                        ) : (
                          <div className="flex gap-1">
                            {rg.permissions.map((p: string) => (
                              <Badge key={p} variant="secondary" className="text-[10px]">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button size="sm" onClick={() => setInspectModalOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
