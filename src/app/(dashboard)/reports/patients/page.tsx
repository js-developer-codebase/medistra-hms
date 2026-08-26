"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface PatientData {
  totalPatients: number;
  newPatientsLast30Days: number;
  genderStats: Record<string, number>;
}

export default function PatientReportsPage() {
  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/reports/patients");
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
    return <div className="p-8">Loading reports...</div>;
  }

  if (!data) {
    return <div className="p-8">No data available.</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Patient Reports</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
            <CardTitle className="text-sm font-medium">New Patients (Last 30 Days)</CardTitle>
            <UserPlus className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.newPatientsLast30Days}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Demographics (Gender)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.genderStats).map(([gender, count]) => (
                <div key={gender} className="flex items-center justify-between">
                  <div className="text-sm font-medium">{gender}</div>
                  <div className="text-sm text-muted-foreground">{count} Patients</div>
                </div>
              ))}
              {Object.keys(data.genderStats).length === 0 && (
                <div className="text-sm text-muted-foreground">No demographic data available.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
