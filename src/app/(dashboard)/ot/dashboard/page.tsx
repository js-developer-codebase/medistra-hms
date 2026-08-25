"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function OTDashboardPage() {
  const [stats, setStats] = useState({ totalSchedules: 0, totalBookings: 0 });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const sRes = await fetch("/api/ot/schedule");
        const bRes = await fetch("/api/ot/booking");
        const sData = await sRes.json();
        const bData = await bRes.json();
        
        if (sData.success && bData.success) {
          setStats({
            totalSchedules: sData.data.length,
            totalBookings: bData.data.length,
          });
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load OT data.", variant: "destructive" });
      }
    }
    fetchData();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operation Theatre Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Scheduled Surgeries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSchedules}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total OT Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
