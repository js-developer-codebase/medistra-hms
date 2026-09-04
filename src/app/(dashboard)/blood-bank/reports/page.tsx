"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  Printer,
  RefreshCw,
  Droplet,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Users
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

export default function BloodReportsPage() {
  const [stats, setStats] = useState<any>({
    totalAvailableUnits: 0,
    totalDonors: 0,
    pendingRequests: 0,
    todayIssues: 0,
    expiringSoon: 0,
    reservedBags: 0,
    groupStock: {},
    componentStock: {}
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blood-bank/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      toast("Failed to load blood reports data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportCSV = () => {
    const csvRows = [
      ["Blood Group", "Units Available in Cold Storage", "Sufficiency Status"],
      ["A+", stats.groupStock?.["A+"] || 0, (stats.groupStock?.["A+"] || 0) < 5 ? "Critical Low" : "Sufficient"],
      ["A-", stats.groupStock?.["A-"] || 0, (stats.groupStock?.["A-"] || 0) < 5 ? "Critical Low" : "Sufficient"],
      ["B+", stats.groupStock?.["B+"] || 0, (stats.groupStock?.["B+"] || 0) < 5 ? "Critical Low" : "Sufficient"],
      ["B-", stats.groupStock?.["B-"] || 0, (stats.groupStock?.["B-"] || 0) < 5 ? "Critical Low" : "Sufficient"],
      ["AB+", stats.groupStock?.["AB+"] || 0, (stats.groupStock?.["AB+"] || 0) < 5 ? "Critical Low" : "Sufficient"],
      ["AB-", stats.groupStock?.["AB-"] || 0, (stats.groupStock?.["AB-"] || 0) < 5 ? "Critical Low" : "Sufficient"],
      ["O+", stats.groupStock?.["O+"] || 0, (stats.groupStock?.["O+"] || 0) < 5 ? "Critical Low" : "Sufficient"],
      ["O-", stats.groupStock?.["O-"] || 0, (stats.groupStock?.["O-"] || 0) < 5 ? "Critical Low" : "Sufficient"],
      [],
      ["Component Type", "Units in Bank"],
      ["Packed Red Blood Cells (PRBC)", stats.componentStock?.PRBC || 0],
      ["Whole Blood (WB)", stats.componentStock?.WHOLE_BLOOD || 0],
      ["Fresh Frozen Plasma (FFP)", stats.componentStock?.FFP || 0],
      ["Platelet Concentrates (RDP/SDP)", stats.componentStock?.PLATELETS || 0],
      ["Cryoprecipitate", stats.componentStock?.CRYOPRECIPITATE || 0]
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `blood_bank_statutory_audit_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Statutory blood report CSV exported!", "success");
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            Blood Bank Regulatory Audits &amp; Hemovigilance Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            State Blood Transfusion Council (SBTC) &amp; DCGI statutory registers, cold-chain compliance, and utilization audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5 text-slate-600" />
            Print Report
          </Button>

          <Button
            size="sm"
            onClick={exportCSV}
            className="text-xs flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Download className="h-4 w-4" />
            Export SBTC CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Safe Tested Inventory
              <Droplet className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-rose-600">
              {stats.totalAvailableUnits} Units
            </div>
            <p className="text-[10px] text-slate-500">100% TTI Non-Reactive</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Total Voluntary Donors
              <Users className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalDonors}
            </div>
            <p className="text-[10px] text-slate-500">Screened &amp; registered</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Crossmatched &amp; Reserved
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.reservedBags} Bags
            </div>
            <p className="text-[10px] text-slate-500">Coombs Gel Card compatible</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              Dispatched Today
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.todayIssues} Units
            </div>
            <p className="text-[10px] text-slate-500">Dual-nurse bedside verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Group-wise Statutory Stock Sufficiency Table */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Droplet className="h-4 w-4 text-rose-600" />
            Statutory Blood Group Sufficiency Register
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Blood Group</TableHead>
                <TableHead>Available Units (Cold Storage)</TableHead>
                <TableHead>Mandatory Safe Threshold</TableHead>
                <TableHead>Sufficiency Level</TableHead>
                <TableHead className="text-center">Emergency Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bloodGroups.map((bg) => {
                const count = stats.groupStock?.[bg] || 0;
                const isCritical = count < 5;
                const isModerate = count >= 5 && count < 10;

                return (
                  <TableRow key={bg} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <TableCell>
                      <Badge className="bg-rose-600 text-white font-bold text-xs">
                        {bg}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {count} Units
                    </TableCell>

                    <TableCell className="font-mono text-slate-600 dark:text-slate-300">
                      &ge; 10 Units
                    </TableCell>

                    <TableCell>
                      <div className="w-36 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            isCritical
                              ? "bg-rose-600"
                              : isModerate
                              ? "bg-amber-500"
                              : "bg-emerald-600"
                          }`}
                          style={{ width: `${Math.min((count / 15) * 100, 100)}%` }}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[9px] ${
                          isCritical
                            ? "bg-rose-600 text-white animate-pulse"
                            : isModerate
                            ? "bg-amber-600 text-white"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {isCritical ? "CRITICAL SHORTAGE" : isModerate ? "MODERATE RESERVE" : "OPTIMAL SUFFICIENCY"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Component Processing & Tariff Benchmarks */}
      <Card className="border shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-600" />
            Therapeutic Fractionation Stock &amp; Processing Tariffs (₹ INR)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border">
              <span className="text-slate-500 font-medium block">Packed Red Cells (PRBC)</span>
              <div className="text-xl font-bold text-rose-600 font-mono mt-0.5">
                {stats.componentStock?.PRBC || 0} Units
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Tariff: ₹1,450 / unit</div>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border">
              <span className="text-slate-500 font-medium block">Whole Blood (WB)</span>
              <div className="text-xl font-bold text-red-600 font-mono mt-0.5">
                {stats.componentStock?.WHOLE_BLOOD || 0} Bags
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Tariff: ₹1,450 / bag</div>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border">
              <span className="text-slate-500 font-medium block">Fresh Frozen Plasma (FFP)</span>
              <div className="text-xl font-bold text-amber-600 font-mono mt-0.5">
                {stats.componentStock?.FFP || 0} Units
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Tariff: ₹1,200 / unit</div>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border">
              <span className="text-slate-500 font-medium block">Platelet Concentrate (RDP)</span>
              <div className="text-xl font-bold text-teal-600 font-mono mt-0.5">
                {stats.componentStock?.PLATELETS || 0} Units
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Tariff: ₹2,200 / unit</div>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 border">
              <span className="text-slate-500 font-medium block">Cryoprecipitate</span>
              <div className="text-xl font-bold text-indigo-600 font-mono mt-0.5">
                {stats.componentStock?.CRYOPRECIPITATE || 0} Units
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Tariff: ₹1,800 / unit</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
