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
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Globe,
  Monitor,
  Check,
  XCircle,
  FileCheck2,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ISecurityEventItem {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  userName?: string;
  eventType: string;
  severity: string;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  details?: string;
  resolutionNotes?: string;
  resolvedBy?: {
    name: string;
    email: string;
  };
  resolvedAt?: string;
  createdAt: string;
}

export default function SecurityEventsPage() {
  const [events, setEvents] = useState<ISecurityEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState<ISecurityEventItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (severityFilter !== "ALL") params.append("severity", severityFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/audit/security?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load security events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [severityFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleOpenResolve = (event: ISecurityEventItem) => {
    setSelectedEvent(event);
    setResolutionNotes(event.resolutionNotes || "");
    setIsResolveModalOpen(true);
  };

  const handleResolveSubmit = async () => {
    if (!selectedEvent || !resolutionNotes) {
      toast({ title: "Validation Error", description: "Please provide resolution notes", variant: "destructive" });
      return;
    }
    try {
      setResolving(true);
      const res = await fetch("/api/audit/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedEvent._id,
          resolutionNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Incident Resolved", description: "Security event status updated to RESOLVED." });
        setIsResolveModalOpen(false);
        fetchEvents();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to resolve incident", variant: "destructive" });
    } finally {
      setResolving(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
      case "HIGH":
        return <Badge variant="destructive" className="text-[10px] uppercase font-bold">{sev}</Badge>;
      case "MEDIUM":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] uppercase font-bold">{sev}</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] uppercase">{sev}</Badge>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case "BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs">
            <XCircle className="w-3.5 h-3.5" /> Blocked
          </span>
        );
      case "INVESTIGATING":
        return (
          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" /> Investigating
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-rose-500 font-semibold text-xs">
            <ShieldAlert className="w-3.5 h-3.5" /> Detected
          </span>
        );
    }
  };

  const openAlerts = events.filter((e) => e.status === "DETECTED" || e.status === "INVESTIGATING").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl dark:bg-rose-950/50">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Security Threat Monitoring Console</h1>
              <p className="text-muted-foreground text-sm">
                Real-time alarms on brute-force attempts, unauthorized endpoint accesses, suspicious IPs, and mass export spikes
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/audit/reports">
            <Button variant="outline" size="sm">
              <FileCheck2 className="w-4 h-4 mr-2 text-primary" />
              Compliance Status
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-rose-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Active Unresolved Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{openAlerts}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Requiring security sign-off</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Resolved & Cleared Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {events.filter((e) => e.status === "RESOLVED").length}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Audited with resolution notes</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Threat Prevention Layer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-foreground flex items-center gap-1 mt-1">
              <Lock className="w-4 h-4 text-primary" /> Automated Firewall Interceptor
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Rate limiting & IP blacklist active</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search incident, IP, user, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            className="flex h-9 w-full sm:w-44 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">High / Critical</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            className="flex h-9 w-full sm:w-44 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="DETECTED">Detected (Open)</option>
            <option value="INVESTIGATING">Under Investigation</option>
            <option value="BLOCKED">Blocked</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Threat Classification</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Incident Status</TableHead>
                <TableHead>Target Identity / IP</TableHead>
                <TableHead>Forensic Description</TableHead>
                <TableHead>Detection Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <RefreshCw className="animate-spin w-5 h-5 mx-auto text-primary" />
                    <span className="text-xs text-muted-foreground mt-2 block">Loading security events...</span>
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground text-sm">
                    No security threat incidents matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((evt) => (
                  <TableRow key={evt._id}>
                    <TableCell>
                      <div className="font-mono text-xs font-bold text-foreground">
                        {evt.eventType}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {evt.location || "External Network"}
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(evt.severity)}</TableCell>
                    <TableCell>{getStatusBadge(evt.status)}</TableCell>
                    <TableCell className="text-xs">
                      <div className="font-mono text-foreground">{evt.ipAddress || "LAN"}</div>
                      <div className="text-muted-foreground text-[11px]">{evt.userName || evt.user?.name || "Anonymous Actor"}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{evt.details}</p>
                      {evt.resolutionNotes && (
                        <div className="text-[11px] text-emerald-600 mt-0.5 line-clamp-1">
                          ✓ Note: {evt.resolutionNotes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(evt.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleOpenResolve(evt)}
                      >
                        {evt.status === "RESOLVED" ? "View Notes" : "Investigate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resolve Modal */}
      <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" /> Security Incident Investigation & Sign-Off
            </DialogTitle>
            <DialogDescription>
              Record audit justification, root cause investigation, and remediation measures.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">{selectedEvent.eventType}</span>
                  {getSeverityBadge(selectedEvent.severity)}
                </div>
                <p className="text-muted-foreground text-xs">{selectedEvent.details}</p>
                <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-between border-t mt-2">
                  <span>Source IP: {selectedEvent.ipAddress || "N/A"}</span>
                  <span>Detected: {new Date(selectedEvent.createdAt).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Investigation & Remediation Notes</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Document actions taken (e.g. firewall rule enforced, user re-authenticated, confirmed false positive)..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>

              {selectedEvent.resolvedBy && (
                <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 text-[11px]">
                  Previously resolved by {selectedEvent.resolvedBy.name} on {new Date(selectedEvent.resolvedAt || "").toLocaleString("en-IN")}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveModalOpen(false)}>Cancel</Button>
            <Button onClick={handleResolveSubmit} disabled={resolving}>
              {resolving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
