"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bed,
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Percent,
  Layers
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function BedOccupancyReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports/beds");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast("Failed to load bed reports: " + json.message, "error");
      }
    } catch (err: any) {
      toast("Error loading bed report: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalBeds = data?.totalBeds || 0;
  const occupiedBeds = data?.occupiedBeds || 0;
  const availableBeds = data?.availableBeds || 0;
  const maintenanceBeds = data?.maintenanceBeds || 0;
  const occupancyRate = data?.occupancyRate || "0%";
  const wardUtilization: any[] = data?.wardUtilization || [];

  const handleExportCSV = () => {
    const headers = ["Ward Name", "Total Beds", "Occupied Beds", "Available Beds", "Occupancy %"];
    const rows = wardUtilization.map((w) => {
      const pct = w.total > 0 ? `${Math.round((w.occupied / w.total) * 100)}%` : "0%";
      return [`"${w.wardName}"`, w.total, w.occupied, w.available, `"${pct}"`];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bed_Occupancy_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Bed report exported to CSV", "success");
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/reports" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Reports Hub
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-sm font-medium text-primary">Bed Utilization</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bed className="h-6 w-6 text-primary" />
            Bed Occupancy Rate (BOR) & Ward Utilization
          </h1>
          <p className="text-muted-foreground text-sm">
            Live hospital bed census, ward-by-ward occupancy yields, ICU capacity monitoring, and maintenance turnarounds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Inpatient Beds</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalBeds}</h3>
              <p className="text-xs text-muted-foreground mt-1">Installed operational capacity</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Bed className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-rose-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Occupied Beds</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600">{occupiedBeds}</h3>
              <p className="text-xs text-rose-600 font-medium mt-1">Currently assigned to patients</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available Ready Beds</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{availableBeds}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Ready for immediate admission</p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Occupancy Rate (BOR)</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{occupancyRate}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">
                {maintenanceBeds} beds under maintenance
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ward-by-Ward Utilization Scorecard */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-semibold">Ward & Departmental Bed Utilization</CardTitle>
          <CardDescription className="text-xs">
            Occupancy rate and real-time bed availability breakdown across hospital wards.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          {wardUtilization.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {loading ? "Loading ward utilization..." : "No wards registered in bed manager."}
            </div>
          ) : (
            wardUtilization.map((ward, idx) => {
              const pct = ward.total > 0 ? Math.round((ward.occupied / ward.total) * 100) : 0;
              const isHigh = pct >= 80;
              const isMed = pct >= 50 && pct < 80;

              return (
                <div key={idx} className="space-y-2 p-3.5 rounded-lg border border-border/60 bg-muted/20">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-foreground text-sm">{ward.wardName}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">
                        Total: <strong className="text-foreground">{ward.total}</strong>
                      </span>
                      <span className="text-rose-600 font-medium">
                        Occupied: <strong>{ward.occupied}</strong>
                      </span>
                      <span className="text-emerald-600 font-medium">
                        Available: <strong>{ward.available}</strong>
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          isHigh
                            ? "bg-rose-50 text-rose-600 border-rose-300"
                            : isMed
                            ? "bg-amber-50 text-amber-600 border-amber-300"
                            : "bg-emerald-50 text-emerald-600 border-emerald-300"
                        }`}
                      >
                        {pct}% BOR
                      </Badge>
                    </div>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        isHigh ? "bg-rose-500" : isMed ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
