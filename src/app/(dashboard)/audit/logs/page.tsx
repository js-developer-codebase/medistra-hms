"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Terminal,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  User,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IAuditLogItem {
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
  entityId?: string;
  entityName?: string;
  category: string;
  severity: string;
  status: string;
  details: string;
  ipAddress?: string;
  device?: string;
  location?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  diffSummary?: string;
  complianceTags?: string[];
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<IAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [severity, setSeverity] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<IAuditLogItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== "ALL") params.append("category", category);
      if (severity !== "ALL") params.append("severity", severity);
      if (status !== "ALL") params.append("status", status);
      if (search) params.append("search", search);

      const res = await fetch(`/api/audit/logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load audit logs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [category, severity, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ["Timestamp", "User", "Role", "Action", "Entity", "Category", "Severity", "Status", "IP", "Details"];
    const rows = logs.map((l) => [
      `"${new Date(l.createdAt).toISOString()}"`,
      `"${l.user?.name || l.userName || 'System'}"`,
      `"${l.user?.role || l.userRole || 'N/A'}"`,
      `"${l.action}"`,
      `"${l.entity}"`,
      `"${l.category}"`,
      `"${l.severity}"`,
      `"${l.status}"`,
      `"${l.ipAddress || 'N/A'}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `medistra_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Started", description: "Audit trail CSV export completed." });
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
      case "HIGH":
        return <Badge variant="destructive" className="text-[10px] uppercase font-bold">{sev}</Badge>;
      case "MEDIUM":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] uppercase font-bold">{sev}</Badge>;
      case "LOW":
        return <Badge variant="secondary" className="text-[10px] uppercase">{sev}</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] uppercase">{sev}</Badge>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Success
          </span>
        );
      case "FAILURE":
      case "BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 text-rose-600 font-medium text-xs">
            <XCircle className="w-3.5 h-3.5" /> {st}
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 text-amber-600 font-medium text-xs">
            <AlertTriangle className="w-3.5 h-3.5" /> Warning
          </span>
        );
      default:
        return <span className="text-xs text-muted-foreground">{st}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/50">
              <Terminal className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">System Audit Logs</h1>
              <p className="text-muted-foreground text-sm">
                Immutable chronological event trail, tamper-resistant access records, and entity transaction history
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={loading || !logs.length}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="shadow-xs border bg-muted/20">
        <CardContent className="pt-5 pb-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search action, entity, user, details, IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs bg-background"
              />
            </div>

            <div>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="SYSTEM">System Events</option>
                <option value="USER_ACTIVITY">User Activity</option>
                <option value="LOGIN">Authentication / Login</option>
                <option value="DATA_ACCESS">Data Access (PHI)</option>
                <option value="RECORD_CHANGE">Record Changes</option>
                <option value="SECURITY">Security Threats</option>
                <option value="DELETION">Deleted Records</option>
              </select>
            </div>

            <div>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="ALL">All Severities</option>
                <option value="INFO">Info</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="flex gap-2">
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
                <option value="WARNING">Warning</option>
                <option value="BLOCKED">Blocked</option>
              </select>
              <Button type="submit" size="sm" className="h-9 px-3 text-xs shrink-0">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP & Location</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Inspect</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16">
                    <RefreshCw className="animate-spin w-5 h-5 mx-auto text-primary" />
                    <span className="text-xs text-muted-foreground mt-2 block">Loading audit trail...</span>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16 text-muted-foreground text-sm">
                    No audit records matching the specified filters.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">
                        {log.user?.name || log.userName || "System Automated"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {log.user?.role || log.userRole || "Service Worker"}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {log.action}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {log.entity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {log.category.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div>{log.ipAddress || "Internal"}</div>
                      <div className="text-[10px]">{log.location || ""}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLog(log);
                          setIsDetailOpen(true);
                        }}
                        title="Inspect Log"
                      >
                        <Eye className="w-4 h-4 text-primary" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Detail Inspector Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" /> Audit Event Inspector
            </DialogTitle>
            <DialogDescription>
              Forensic metadata, field-level diffs, and compliance tags for event #{selectedLog?._id}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border bg-muted/20">
                <div>
                  <span className="text-muted-foreground">Action:</span>
                  <p className="font-mono font-bold text-foreground mt-0.5">{selectedLog.action}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Target Entity:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedLog.entity} {selectedLog.entityName ? `(${selectedLog.entityName})` : ""}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Actor User:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedLog.user?.name || selectedLog.userName || "System"} ({selectedLog.user?.role || selectedLog.userRole || "N/A"})
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Timestamp:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {new Date(selectedLog.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Event Description & Activity Details</Label>
                <div className="p-3 rounded-lg border bg-background text-foreground mt-1 leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>

              {selectedLog.diffSummary && (
                <div>
                  <Label className="text-xs font-semibold text-blue-600">Field Modification Summary</Label>
                  <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-blue-950 dark:text-blue-200 mt-1">
                    {selectedLog.diffSummary}
                  </div>
                </div>
              )}

              {(selectedLog.oldValue || selectedLog.newValue) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="font-semibold text-rose-600">Previous State (Old)</span>
                    <pre className="p-2 rounded border bg-rose-50/30 dark:bg-rose-950/20 font-mono text-[11px] overflow-auto max-h-36">
                      {JSON.stringify(selectedLog.oldValue || {}, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-emerald-600">Updated State (New)</span>
                    <pre className="p-2 rounded border bg-emerald-50/30 dark:bg-emerald-950/20 font-mono text-[11px] overflow-auto max-h-36">
                      {JSON.stringify(selectedLog.newValue || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">IP Address:</span> {selectedLog.ipAddress || "Internal"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Device:</span> {selectedLog.device || "Browser"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Location:</span> {selectedLog.location || "On-Premise"}
                </div>
              </div>

              {selectedLog.complianceTags && selectedLog.complianceTags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-muted-foreground">Compliance Tags:</span>
                  {selectedLog.complianceTags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px] font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
