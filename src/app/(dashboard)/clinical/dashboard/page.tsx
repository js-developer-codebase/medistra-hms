"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Stethoscope, FileText, ActivitySquare } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ClinicalDashboardPage() {
  const [stats, setStats] = useState({
    recordsCount: 0,
    diagnosesCount: 0,
    vitalsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [recordsRes, diagRes, vitalsRes] = await Promise.all([
          fetch("/api/clinical/records"),
          fetch("/api/clinical/diagnoses"),
          fetch("/api/clinical/vitals")
        ]);

        const recordsData = await recordsRes.json();
        const diagData = await diagRes.json();
        const vitalsData = await vitalsRes.json();

        setStats({
          recordsCount: recordsData.data?.length || 0,
          diagnosesCount: diagData.data?.length || 0,
          vitalsCount: vitalsData.data?.length || 0,
        });
      } catch (error) {
        toast({ title: "Error fetching data", description: "Could not load clinical stats", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Clinical Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recordsCount}</div>
            <p className="text-xs text-muted-foreground">Clinical documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Diagnoses</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.diagnosesCount}</div>
            <p className="text-xs text-muted-foreground">Patient conditions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vitals Recorded</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vitalsCount}</div>
            <p className="text-xs text-muted-foreground">Recent measurements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <ActivitySquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Stable</div>
            <p className="text-xs text-muted-foreground">System status</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
