"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  LogIn,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  Monitor,
  ShieldAlert,
  Lock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ILoginLog {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  userName?: string;
  userRole?: string;
  action: string;
  severity: string;
  status: string;
  details: string;
  ipAddress?: string;
  device?: string;
  location?: string;
  createdAt: string;
}

export default function LoginHistoryPage() {
  const [logs, setLogs] = useState<ILoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { toast } = useToast();

  const fetchLoginLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/audit/login?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load login history", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginLogs();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLoginLogs();
  };

  const successCount = logs.filter((l) => l.status === "SUCCESS").length;
  const failureCount = logs.filter((l) => l.status === "FAILURE" || l.status === "BLOCKED").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl dark:bg-amber-950/50">
              <LogIn className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Login History & Access Security</h1>
              <p className="text-muted-foreground text-sm">
                Authentication trials, successful clinical sessions, brute-force lockouts, and IP geolocations
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLoginLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/audit/security">
            <Button variant="outline" size="sm">
              <ShieldAlert className="w-4 h-4 mr-2 text-rose-600" />
              Security Console
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Successful Authentications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{successCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Verified staff & clinician sessions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Failed Attempts & Lockouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{failureCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Invalid passwords or blocked attempts</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              MFA & Policy Enforcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
              <Lock className="w-4 h-4" /> 5-Trial Max Lockout Active
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">ISO 27001 Access Control Standard</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user, IP address, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground shrink-0">Status:</span>
          <select
            className="flex h-9 w-full sm:w-56 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Authentication Events</option>
            <option value="SUCCESS">Successful Logins Only</option>
            <option value="FAILURE">Failed Password Trials</option>
            <option value="BLOCKED">Enforced Account Lockouts</option>
          </select>
        </div>
      </div>

      {/* Login History Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Identity</TableHead>
                <TableHead>Authentication Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Device & Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <RefreshCw className="animate-spin w-5 h-5 mx-auto text-primary" />
                    <span className="text-xs text-muted-foreground mt-2 block">Loading login events...</span>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground text-sm">
                    No login events matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.status === "SUCCESS";
                  const isBlocked = log.status === "BLOCKED";

                  return (
                    <TableRow key={log._id}>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">
                          {log.user?.name || log.userName || "Unknown Candidate"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {log.user?.email || "N/A"} • {log.user?.role || log.userRole || "External"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isSuccess ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase font-semibold">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Success
                          </Badge>
                        ) : isBlocked ? (
                          <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                            <XCircle className="w-3 h-3 mr-1" /> Lockout Block
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] uppercase font-semibold">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Failed Trial
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground">
                        {log.action}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground">
                        {log.ipAddress || "127.0.0.1"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                          <span>{log.device || "Chrome / Web"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                          <span>{log.location || "Central Campus"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
