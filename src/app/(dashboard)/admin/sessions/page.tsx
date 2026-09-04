"use client";

import React, { useEffect, useState } from "react";
import {
  Laptop,
  Search,
  Filter,
  RefreshCw,
  Power,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Globe,
  Smartphone,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function UserSessionsPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [terminatingAll, setTerminatingAll] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/sessions?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSessions(json.data || []);
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load user sessions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions();
  };

  const handleTerminateSession = async (id: string) => {
    if (!confirm("Are you sure you want to terminate this user session? The user will be logged out immediately.")) return;
    try {
      const res = await fetch(`/api/admin/sessions/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Session Terminated", description: "Access token successfully revoked." });
        fetchSessions();
      } else {
        toast({ title: "Termination Failed", description: json.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleTerminateAllStale = async () => {
    if (!confirm("Are you sure you want to revoke all stale and expired sessions?")) return;
    try {
      setTerminatingAll(true);
      const res = await fetch("/api/admin/sessions", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Cleanup Successful", description: json.message });
        fetchSessions();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setTerminatingAll(false);
    }
  };

  const activeCount = sessions.filter((s) => s.status === "ACTIVE").length;
  const terminatedCount = sessions.filter((s) => s.status === "TERMINATED").length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-lg">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Active User Sessions & Tokens</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Real-time authentication token monitor, client device inspection, and session termination controls.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleTerminateAllStale}
            disabled={terminatingAll}
          >
            <Power className="w-4 h-4 mr-1.5" />
            {terminatingAll ? "Cleaning up..." : "Revoke Stale Sessions"}
          </Button>
        </div>
      </div>

      {/* Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Audited Sessions
            </CardTitle>
            <Laptop className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : sessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Logged authorization tokens</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Connected Tokens
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : activeCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently authenticated workstations</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Terminated / Revoked
            </CardTitle>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {loading ? "..." : terminatedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Forced logout or security revocations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="shadow-sm border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search user name, email, IP address, device, or browser..."
                  className="pl-9 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" size="sm" className="text-xs">
                Filter
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <span className="text-xs font-medium text-muted-foreground">Status:</span>
              {["ALL", "ACTIVE", "TERMINATED", "EXPIRED"].map((st) => (
                <Button
                  key={st}
                  variant={statusFilter === st ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card className="border shadow-sm">
        <CardHeader className="py-3.5 px-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Authentication Sessions ({sessions.length})
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Live token monitoring
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading active sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No sessions found matching current filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left font-medium text-muted-foreground">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">IP & Location</th>
                    <th className="py-3 px-4">Device & Browser</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sessions.map((s) => (
                    <tr key={s._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">
                          {s.userId?.name || "System User"}
                        </div>
                        <div className="text-muted-foreground text-[11px]">
                          {s.userId?.email || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-mono text-[11px]">
                          {s.userId?.role?.role || "User"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-foreground">{s.ipAddress || "127.0.0.1"}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Globe className="w-3 h-3 text-muted-foreground" />
                          {s.location || "Hospital Network"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-foreground font-medium flex items-center gap-1">
                          <Monitor className="w-3 h-3 text-muted-foreground" />
                          {s.device || "Desktop Terminal"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {s.browser || "Chrome"} ({s.os || "Windows"})
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            s.status === "ACTIVE"
                              ? "default"
                              : s.status === "TERMINATED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString() : "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {s.status === "ACTIVE" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            onClick={() => handleTerminateSession(s._id)}
                          >
                            <Power className="w-3.5 h-3.5 mr-1" /> Terminate
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">Revoked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
