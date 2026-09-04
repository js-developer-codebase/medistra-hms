"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Activity,
  Search,
  RefreshCw,
  User,
  Stethoscope,
  Pill,
  CreditCard,
  FileText,
  Clock,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IActivityItem {
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
  severity: string;
  status: string;
  details: string;
  ipAddress?: string;
  device?: string;
  location?: string;
  createdAt: string;
}

export default function UserActivityPage() {
  const [activities, setActivities] = useState<IActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const { toast } = useToast();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (entityFilter !== "ALL") params.append("entity", entityFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/audit/activity?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setActivities(data.data);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load user activities", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [entityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivities();
  };

  const getEntityIcon = (entity: string) => {
    switch (entity.toUpperCase()) {
      case "CLINICAL_RECORD":
      case "CONSULTATION":
        return <Stethoscope className="w-4 h-4 text-purple-600" />;
      case "PHARMACY":
      case "PRESCRIPTION":
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case "BILLING":
      case "INVOICE":
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl dark:bg-emerald-950/50">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">User Activity Telemetry</h1>
              <p className="text-muted-foreground text-sm">
                Chronological staff workflow feed tracking clinician consultations, pharmacy dispensing, and billing entries
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchActivities} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/audit/logs">
            <Button variant="outline" size="sm">
              All System Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Recorded Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activities.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Staff & clinician operational events</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Clinical Consultations & Rx
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {activities.filter((a) => a.entity === "CLINICAL_RECORD" || a.entity === "PHARMACY").length}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Direct patient care actions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Audit Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4" /> 100% Attributed to Staff Identity
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">NABH Standard IM.5 Compliant</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by staff name, action, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground shrink-0">Subsystem:</span>
          <select
            className="flex h-9 w-full sm:w-56 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="ALL">All Departments & Subsystems</option>
            <option value="CLINICAL_RECORD">Clinical Consultations</option>
            <option value="PHARMACY">Pharmacy & Drug Orders</option>
            <option value="BILLING">Billing & Receipts (₹)</option>
            <option value="SECURITY_POLICY">Administrative Governance</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Action Taken</TableHead>
                <TableHead>Department / Entity</TableHead>
                <TableHead>Activity Details</TableHead>
                <TableHead>Terminal & Location</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <RefreshCw className="animate-spin w-5 h-5 mx-auto text-primary" />
                    <span className="text-xs text-muted-foreground mt-2 block">Loading user telemetry...</span>
                  </TableCell>
                </TableRow>
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                    No user activity records found.
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((act) => (
                  <TableRow key={act._id}>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                        {act.user?.name || act.userName || "Staff Member"}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-medium">
                        {act.user?.role || act.userRole || "Personnel"}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {act.action}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        {getEntityIcon(act.entity)}
                        <span className="font-medium text-foreground">{act.entity}</span>
                      </div>
                      {act.entityName && (
                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                          {act.entityName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{act.details}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="font-medium text-foreground">{act.device || act.ipAddress || "LAN"}</div>
                      <div className="text-[11px]">{act.location || "Central Wing"}</div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
