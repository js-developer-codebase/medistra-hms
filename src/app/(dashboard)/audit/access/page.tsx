"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Eye,
  Search,
  RefreshCw,
  ShieldCheck,
  FileHeart,
  User,
  CheckCircle2,
  Lock,
  Tag,
  ExternalLink,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IAccessLog {
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
  entity: string;
  entityName?: string;
  details: string;
  patientId?: {
    _id: string;
    firstName: string;
    lastName: string;
    uhid: string;
  };
  ipAddress?: string;
  device?: string;
  location?: string;
  complianceTags?: string[];
  createdAt: string;
}

export default function DataAccessLogsPage() {
  const [logs, setLogs] = useState<IAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchAccessLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const res = await fetch(`/api/audit/access?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load access logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessLogs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAccessLogs();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl dark:bg-purple-950/50">
              <Eye className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Access Logs (PHI / EHR)</h1>
              <p className="text-muted-foreground text-sm">
                Protected Health Information chart access trail complying with HIPAA Privacy, DISHA & NABH Confidentiality Rules
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAccessLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/audit/reports">
            <Button variant="outline" size="sm">
              <ShieldCheck className="w-4 h-4 mr-2 text-teal-600" />
              HIPAA / DISHA Audit
            </Button>
          </Link>
        </div>
      </div>

      {/* Compliance Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-purple-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Monitored Patient Chart Reads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{logs.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">EHR/PHR inspections logged with staff identity</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Regulatory Standards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-teal-600 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4" /> HIPAA § 164.312(b) & DISHA
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Automated non-repudiation audit logging</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Access Governance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-blue-600 flex items-center gap-1 mt-1">
              <Lock className="w-4 h-4" /> Role-Based Purpose Validation
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Legitimate medical care justification</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patient, doctor, action, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </form>
      </div>

      {/* Access Logs Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Accessing Staff Member</TableHead>
                <TableHead>Target Patient / PHI Record</TableHead>
                <TableHead>Access Purpose & Clinical Details</TableHead>
                <TableHead>Compliance Standards</TableHead>
                <TableHead>Device & Location</TableHead>
                <TableHead className="text-right">Access Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <RefreshCw className="animate-spin w-5 h-5 mx-auto text-primary" />
                    <span className="text-xs text-muted-foreground mt-2 block">Loading data access records...</span>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                    No data access records matching query.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const patientLabel = log.patientId
                    ? `${log.patientId.firstName} ${log.patientId.lastName} (${log.patientId.uhid || "UHID"})`
                    : log.entityName || "Patient Record";

                  return (
                    <TableRow key={log._id}>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary" />
                          {log.user?.name || log.userName || "Clinician / Staff"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {log.user?.role || log.userRole || "Personnel"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <FileHeart className="w-3.5 h-3.5 text-rose-500" />
                          <span>{patientLabel}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono mt-0.5">
                          {log.entity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-md">
                        <p className="line-clamp-2 leading-relaxed">{log.details}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {log.complianceTags && log.complianceTags.length > 0 ? (
                            log.complianceTags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] font-mono">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="secondary" className="text-[10px] font-mono">
                              HIPAA
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="font-medium text-foreground">{log.ipAddress || "Internal"}</div>
                        <div className="text-[11px]">{log.location || log.device || "OPD Ward"}</div>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
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
