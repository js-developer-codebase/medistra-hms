"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  History,
  Search,
  RefreshCw,
  ArrowRight,
  User,
  Eye,
  FileDiff,
  CheckCircle2,
  Calendar,
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

interface IChangeLog {
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
  diffSummary?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  location?: string;
  createdAt: string;
}

export default function RecordChangesPage() {
  const [changes, setChanges] = useState<IChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedChange, setSelectedChange] = useState<IChangeLog | null>(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchChanges = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const res = await fetch(`/api/audit/changes?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setChanges(data.data);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load record changes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChanges();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChanges();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl dark:bg-indigo-950/50">
              <History className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Record Change History & Diff Tracker</h1>
              <p className="text-muted-foreground text-sm">
                Field-level before-and-after change ledger on clinical prescriptions, patient billing in ₹, and order modifications
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchChanges} disabled={loading}>
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-indigo-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Audited Modifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{changes.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Field-level state transitions tracked</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Data Integrity Guarantee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4" /> Non-Repudiation Versioning
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Dual-state before & after recording</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Financial Currency Standard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-blue-600 flex items-center gap-1.5 mt-1">
              <span className="font-bold text-base">₹</span> Indian Rupee (INR)
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">All tariff & invoice adjustments tracked in ₹</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search modified record, user, or diff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </form>
      </div>

      {/* Changes Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Authorizing User</TableHead>
                <TableHead>Target Entity & Record</TableHead>
                <TableHead>Change Summary / Diff</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Compare States</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <RefreshCw className="animate-spin w-5 h-5 mx-auto text-primary" />
                    <span className="text-xs text-muted-foreground mt-2 block">Loading record modifications...</span>
                  </TableCell>
                </TableRow>
              ) : changes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                    No record change history found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                changes.map((change) => (
                  <TableRow key={change._id}>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                        {change.user?.name || change.userName || "Staff"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {change.user?.role || change.userRole || "Personnel"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">
                        {change.entityName || change.entity}
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono mt-0.5">
                        {change.entity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-md">
                      <div className="font-medium text-foreground text-xs line-clamp-1">
                        {change.diffSummary || change.details}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {change.details}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div>{change.location || "Central Hospital"}</div>
                      <div className="text-[10px] font-mono">{change.ipAddress || "Internal"}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(change.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary"
                        onClick={() => {
                          setSelectedChange(change);
                          setIsDiffModalOpen(true);
                        }}
                      >
                        <FileDiff className="w-4 h-4 mr-1" /> View Diff
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diff Comparison Modal */}
      <Dialog open={isDiffModalOpen} onOpenChange={setIsDiffModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileDiff className="w-5 h-5 text-indigo-600" /> State Transition Diff Inspector
            </DialogTitle>
            <DialogDescription>
              Side-by-side comparison of previous values versus updated values for {selectedChange?.entityName || selectedChange?.entity}.
            </DialogDescription>
          </DialogHeader>
          {selectedChange && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
                <div className="font-semibold text-foreground text-sm">
                  {selectedChange.diffSummary || selectedChange.details}
                </div>
                <p className="text-muted-foreground text-xs">
                  Modified by {selectedChange.user?.name || selectedChange.userName || "Staff"} on {new Date(selectedChange.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-rose-600">
                    <span>Previous State (Before)</span>
                    <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-300">OLD</Badge>
                  </div>
                  <pre className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 font-mono text-xs overflow-auto max-h-56 leading-relaxed">
                    {JSON.stringify(selectedChange.oldValue || { note: "Initial state not recorded" }, null, 2)}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-600">
                    <span>Updated State (After)</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">NEW</Badge>
                  </div>
                  <pre className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 font-mono text-xs overflow-auto max-h-56 leading-relaxed">
                    {JSON.stringify(selectedChange.newValue || { note: "Modified state recorded" }, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-background text-[11px] text-muted-foreground flex justify-between items-center">
                <span>Audit Signature ID: {selectedChange._id}</span>
                <span>Authorized IP: {selectedChange.ipAddress || "LAN"}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
