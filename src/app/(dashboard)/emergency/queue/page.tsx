"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ListOrdered,
  Flame,
  AlertTriangle,
  Clock,
  UserCheck,
  Search,
  BedDouble,
  RefreshCw,
  Stethoscope,
  Syringe,
  Building2,
  LogOut,
  Truck,
  Activity,
  ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function EmergencyQueuePage() {
  const [casualties, setCasualties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [bayFilter, setBayFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/emergency/casualty");
      const data = await res.json();
      if (data.success) {
        setCasualties(data.data || []);
      }
    } catch (err) {
      toast("Failed to load emergency queue", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const timer = setInterval(fetchQueue, 15000); // 15s live polling
    return () => clearInterval(timer);
  }, []);

  const activeCasualties = useMemo(() => {
    return casualties
      .filter((c) => c.status !== "DISCHARGED" && c.status !== "ADMITTED" && c.status !== "EXPIRED")
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { Red: 1, Orange: 2, Yellow: 3, Green: 4 };
        const pA = priorityOrder[a.triagePriority] || 5;
        const pB = priorityOrder[b.triagePriority] || 5;
        if (pA !== pB) return pA - pB;
        return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
      });
  }, [casualties]);

  const filteredQueue = useMemo(() => {
    return activeCasualties.filter((c) => {
      const pName = c.patientName || "";
      const caseNo = c.caseNumber || "";
      const complaints = c.chiefComplaints || "";

      const matchesSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        caseNo.toLowerCase().includes(search.toLowerCase()) ||
        complaints.toLowerCase().includes(search.toLowerCase());

      const matchesPriority =
        priorityFilter === "ALL" || c.triagePriority === priorityFilter;

      const matchesBay =
        bayFilter === "ALL" || c.assignedBay === bayFilter;

      return matchesSearch && matchesPriority && matchesBay;
    });
  }, [activeCasualties, search, priorityFilter, bayFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/emergency/casualty/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast(`Patient status updated to ${newStatus}`, "success");
        fetchQueue();
      } else {
        toast(data.message || "Failed to update status", "error");
      }
    } catch (err) {
      toast("Error updating status", "error");
    }
  };

  const getElapsedTime = (arrival: string) => {
    const diffMs = Date.now() - new Date(arrival).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m in ER`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m in ER`;
  };

  const renderPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "Red":
        return (
          <Badge className="bg-rose-600 text-white animate-pulse text-[10px] flex items-center gap-1">
            <Flame className="h-3 w-3" /> Resuscitation (Red)
          </Badge>
        );
      case "Orange":
        return (
          <Badge className="bg-orange-500 text-white text-[10px] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Emergent (Orange)
          </Badge>
        );
      case "Yellow":
        return (
          <Badge className="bg-amber-400 text-slate-900 text-[10px]">
            Urgent (Yellow)
          </Badge>
        );
      case "Green":
      default:
        return (
          <Badge className="bg-emerald-600 text-white text-[10px]">
            Less Urgent (Green)
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ListOrdered className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Live Emergency Tracking Board
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time ER patient monitor sorted by clinical acuity, wait time, bay assignment, and care progression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueue}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Board
          </Button>

          <Link href="/emergency/registration">
            <Button size="sm" className="text-xs bg-rose-600 hover:bg-rose-700 text-white">
              + New Intake
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search active patients, case #, complaint..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All Severities ({activeCasualties.length})</option>
                <option value="Red">Red (Level 1)</option>
                <option value="Orange">Orange (Level 2)</option>
                <option value="Yellow">Yellow (Level 3)</option>
                <option value="Green">Green (Level 4)</option>
              </select>
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={bayFilter}
                onChange={(e) => setBayFilter(e.target.value)}
              >
                <option value="ALL">All ER Bays</option>
                <option value="Resuscitation Bay 1">Resuscitation Bay 1</option>
                <option value="Resuscitation Bay 2">Resuscitation Bay 2</option>
                <option value="Trauma Bay">Trauma Bay</option>
                <option value="Acute Bay 1">Acute Bay 1</option>
                <option value="Acute Bay 2">Acute Bay 2</option>
                <option value="Acute Bay 3">Acute Bay 3</option>
                <option value="Pediatric ER Bay">Pediatric ER Bay</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Tracking Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-600" />
            Active ER Patient Monitor ({filteredQueue.length} Active Patients)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Priority</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Bay / Location</TableHead>
                <TableHead>Wait Time</TableHead>
                <TableHead>Chief Complaint</TableHead>
                <TableHead>Care Stage</TableHead>
                <TableHead className="text-center">Workstation Gateways</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    No active emergency cases currently in queue.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQueue.map((c) => (
                  <TableRow
                    key={c._id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      c.triagePriority === "Red" ? "bg-rose-50/40 dark:bg-rose-950/20" : ""
                    }`}
                  >
                    <TableCell>{renderPriorityBadge(c.triagePriority)}</TableCell>

                    <TableCell>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {c.patientName}
                        {c.isMLC && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0">
                            MLC
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {c.caseNumber} {c.age ? `(${c.age}y/${c.gender?.[0]})` : ""}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                        {c.assignedBay || "Acute Bay 1"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {getElapsedTime(c.arrivalTime)}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        arr: {new Date(c.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs truncate text-slate-700 dark:text-slate-300">
                        {c.chiefComplaints}
                      </div>
                    </TableCell>

                    <TableCell>
                      <select
                        className="h-7 rounded border border-input bg-background px-2 py-0 text-[11px] shadow-sm font-medium"
                        value={c.status}
                        onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                      >
                        <option value="REGISTERED">Registered</option>
                        <option value="TRIAGED">Triaged</option>
                        <option value="IN_CONSULTATION">In Consultation</option>
                        <option value="UNDER_TREATMENT">Under Treatment</option>
                      </select>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href="/emergency/consultation" title="Doctor Consultation">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <Stethoscope className="h-3.5 w-3.5 text-purple-600" />
                          </Button>
                        </Link>

                        <Link href="/emergency/orders" title="STAT Orders">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <Flame className="h-3.5 w-3.5 text-orange-600" />
                          </Button>
                        </Link>

                        <Link href="/emergency/treatment" title="Trauma / Procedure Treatment">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <Syringe className="h-3.5 w-3.5 text-teal-600" />
                          </Button>
                        </Link>

                        <Link href="/emergency/admission" title="Admit to ICU / Inpatient">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                          </Button>
                        </Link>

                        <Link href="/emergency/discharge" title="Discharge Patient">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-slate-600">
                            <LogOut className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
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
