"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function EmergencyDashboardPage() {
  const [stats, setStats] = useState({ totalTriages: 0, totalCasualties: 0 });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const tRes = await fetch("/api/emergency/triage");
        const cRes = await fetch("/api/emergency/casualty");
        const tData = await tRes.json();
        const cData = await cRes.json();
        
        if (tData.success && cData.success) {
          setStats({
            totalTriages: tData.data.length,
            totalCasualties: cData.data.length,
          });
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" });
      }
    }
    fetchData();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Emergency Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of emergency and casualty status.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Triages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTriages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Casualties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCasualties}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
