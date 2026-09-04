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
  Trash2,
  Search,
  RefreshCw,
  Eye,
  User,
  ShieldCheck,
  AlertTriangle,
  Archive,
  FileX2,
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

interface IDeletedLog {
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
  ipAddress?: string;
  location?: string;
  createdAt: string;
}

export default function DeletedRecordsPage() {
  const [records, setRecords] = useState<IDeletedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<IDeletedLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const fetchDeleted = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const res = await fetch(`/api/audit/deleted?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to load deleted records", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeleted();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl dark:bg-orange-950/50">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Deleted Records Forensic Ledger</h1>
              <p className="text-muted-foreground text-sm">
                Tamper-evident forensic repository tracking voided diagnostic orders, cancelled invoices (₹), and purged clinical items
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDeleted} disabled={loading}>
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

      {/* Forensic Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-orange-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Audited Deletions & Voided Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{records.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Retained with authorizer identity</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Forensic Retention Guarantee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-teal-600 flex items-center gap-1 mt-1">
              <Archive className="w-4 h-4" /> 7-Year Cold Archival
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Zero hard deletions without audit snapshot</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Financial & Clinical Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-blue-600 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4" /> Statutory Anti-Fraud Trail
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Mandatory justification on cancellations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search deleted record, user, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </form>
      </div>

      {/* Deleted Records Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deleted Record / Entity</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Authorizing User</TableHead>
                <TableHead>Deletion Reason & Details</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Inspect</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <RefreshCw className="animate-spin w-5 h-5 mx-auto text-primary" />
                    <span className="text-xs text-muted-foreground mt-2 block">Loading deleted records ledger...</span>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground text-sm">
                    No deleted record entries found matching query.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((rec) => (
                  <TableRow key={rec._id}>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <FileX2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>{rec.entityName || rec.entity}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono mt-0.5">
                        {rec.entity}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-rose-600 font-semibold">
                      {rec.action}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                        {rec.user?.name || rec.userName || "Staff Member"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {rec.user?.role || rec.userRole || "Personnel"}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-md">
                      <div className="font-medium text-foreground text-xs line-clamp-1">
                        {rec.diffSummary || rec.details}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {rec.details}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div>{rec.location || "Hospital Facility"}</div>
                      <div className="text-[10px] font-mono">{rec.ipAddress || "Internal"}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(rec.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedRecord(rec);
                          setIsDetailOpen(true);
                        }}
                        title="Inspect Forensic Record"
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

      {/* Forensic Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-orange-600" /> Forensic Deleted Record Dossier
            </DialogTitle>
            <DialogDescription>
              Snapshot of deleted record state before cancellation for {selectedRecord?.entityName || selectedRecord?.entity}.
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
                <div className="font-semibold text-foreground text-sm">
                  {selectedRecord.entityName || selectedRecord.entity}
                </div>
                <p className="text-muted-foreground text-xs">
                  Cancelled by {selectedRecord.user?.name || selectedRecord.userName || "Staff"} on {new Date(selectedRecord.createdAt).toLocaleString("en-IN")}
                </p>
                <p className="text-xs font-medium text-foreground pt-1">
                  Reason: {selectedRecord.diffSummary || selectedRecord.details}
                </p>
              </div>

              {selectedRecord.oldValue && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-rose-600">Preserved Record Snapshot Before Deletion</Label>
                  <pre className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 font-mono text-xs overflow-auto max-h-56 leading-relaxed">
                    {JSON.stringify(selectedRecord.oldValue, null, 2)}
                  </pre>
                </div>
              )}

              <div className="p-3 rounded-lg border bg-background text-[11px] text-muted-foreground flex justify-between items-center">
                <span>Audit Signature: {selectedRecord._id}</span>
                <span>Terminal IP: {selectedRecord.ipAddress || "LAN"}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
