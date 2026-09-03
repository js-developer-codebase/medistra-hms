"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Banknote, Activity } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ManagementData {
  totalPatients: number;
  totalAppointments: number;
  appointmentsToday: number;
  totalRevenue: number;
}

export default function ManagementDashboardPage() {
  const [data, setData] = useState<ManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reports/management");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          toast({
            title: "Error",
            description: json.message || "Failed to fetch data",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8">No data available.</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Management Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPatients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.appointmentsToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Banknote className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
