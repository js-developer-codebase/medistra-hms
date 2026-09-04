"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Droplet,
  Users,
  Layers,
  HeartPulse,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export default function BloodBankDashboardPage() {
  const [stats, setStats] = useState<any>({
    totalAvailableUnits: 0,
    totalDonors: 0,
    pendingRequests: 0,
    todayIssues: 0,
    expiringSoon: 0,
    reservedBags: 0,
    groupStock: {},
    criticalGroups: [],
    componentStock: {}
  });
  const [recentInventory, setRecentInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [sRes, invRes] = await Promise.all([
        fetch("/api/blood-bank/stats"),
        fetch("/api/blood-bank/inventory")
      ]);

      const sData = await sRes.json();
      if (sData.success) setStats(sData.data);

      const invData = await invRes.json();
      if (invData.success) setRecentInventory(invData.data?.slice(0, 6) || []);
    } catch (err) {
      toast("Failed to load blood bank dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            Blood Bank Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time blood stock sufficiency, voluntary donation throughput, crossmatch compatibility, and hemovigilance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/blood-bank/inventory">
            <Button size="sm" className="text-xs bg-rose-600 hover:bg-rose-700 text-white">
              View Full Inventory
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Tested &amp; Safe Units
              <Droplet className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {stats.totalAvailableUnits}
            </div>
            <p className="text-[10px] text-slate-500">Certified for transfusion</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Registered Donors
              <Users className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalDonors}
            </div>
            <p className="text-[10px] text-slate-500">Voluntary &amp; replacement</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Reserved for OT / Patients
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.reservedBags}
            </div>
            <p className="text-[10px] text-slate-500">Crossmatched bags</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Dispatched Today
              <Activity className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.todayIssues}
            </div>
            <p className="text-[10px] text-slate-500">Dispensed to wards</p>
          </CardContent>
        </Card>
      </div>

      {/* Group Breakdown & Recent Inventory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Inventory Table (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-rose-600" />
                Recent Certified Blood Bags ({recentInventory.length} Units)
              </CardTitle>
              <Link href="/blood-bank/inventory">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-600">
                  Full Inventory &rarr;
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead>Bag Number</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Storage Unit</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                        No blood bags currently in stock.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentInventory.map((item) => (
                      <TableRow key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                          {item.bagNumber}
                        </TableCell>

                        <TableCell>
                          <Badge className="bg-rose-600 text-white font-bold text-[10px]">
                            {item.bloodGroup}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                          {item.componentType}
                        </TableCell>

                        <TableCell className="text-slate-600 dark:text-slate-300">
                          {item.storageLocation}
                        </TableCell>

                        <TableCell className="font-mono text-[11px]">
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            variant={item.status === "AVAILABLE" ? "outline" : "secondary"}
                            className="text-[10px]"
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right: Quick Action Gateways (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-rose-600" />
                Emergency Operations Quickdesk
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <Link href="/blood-bank/cross-matching" className="block">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 border transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Emergency Crossmatch</div>
                    <div className="text-[10px] text-slate-500">Perform Gel Card Coombs compatibility test</div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                </div>
              </Link>

              <Link href="/blood-bank/issue" className="block">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 border transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Dispense Blood Unit</div>
                    <div className="text-[10px] text-slate-500">Issue with dual-nurse verification &amp; slip</div>
                  </div>
                  <Droplet className="h-4 w-4 text-rose-600" />
                </div>
              </Link>

              <Link href="/blood-bank/collection" className="block">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 border transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Phlebotomy Session</div>
                    <div className="text-[10px] text-slate-500">Log collection &amp; component separation</div>
                  </div>
                  <HeartPulse className="h-4 w-4 text-emerald-600" />
                </div>
              </Link>

              <Link href="/blood-bank/return" className="block">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 border transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Blood Return &amp; Wastage</div>
                    <div className="text-[10px] text-slate-500">Cold-chain check or biohazard discard</div>
                  </div>
                  <RotateCcw className="h-4 w-4 text-orange-600" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
